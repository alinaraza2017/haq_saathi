/**
 * The ONLY module that talks to Gemini.
 *
 * Provider switch (1 line in .env):
 *   VITE_AI_PROVIDER=firebase  -> Firebase AI Logic (firebase/ai, Gemini Developer API backend)
 *   VITE_AI_PROVIDER=genai     -> @google/genai with VITE_GEMINI_API_KEY
 * If unset: firebase when a Firebase config exists, otherwise genai.
 */
import { getFirebaseApp, isFirebaseConfigured } from "./firebase";

export const MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-3.8-flash";
export const PROVIDER: "firebase" | "genai" =
  (import.meta.env.VITE_AI_PROVIDER as "firebase" | "genai") || (isFirebaseConfigured ? "firebase" : "genai");

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
export interface Content {
  role: "user" | "model";
  parts: Part[];
}

export interface GenerateOptions {
  system: string;
  contents: Content[];
  /** Plain JSON Schema. When set, output is forced to JSON matching it. */
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
}

export function isAIConfigured(): boolean {
  return PROVIDER === "firebase" ? isFirebaseConfigured : Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

export async function generate(opts: GenerateOptions): Promise<string> {
  if (!isAIConfigured()) throw new Error(`AI provider "${PROVIDER}" is not configured`);
  return PROVIDER === "firebase" ? viaFirebase(opts) : viaGenAI(opts);
}

export async function generateJSON<T>(opts: GenerateOptions & { jsonSchema: Record<string, unknown> }): Promise<T> {
  const text = await generate(opts);
  return JSON.parse(stripFences(text)) as T;
}

function stripFences(s: string) {
  return s.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
}

async function viaFirebase({ system, contents, jsonSchema, temperature = 0.3 }: GenerateOptions) {
  const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
  const ai = getAI(getFirebaseApp()!, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: MODEL,
    systemInstruction: system,
    generationConfig: {
      temperature,
      ...(jsonSchema ? { responseMimeType: "application/json", responseJsonSchema: jsonSchema } : {}),
    },
  });
  // firebase/ai v13 uses discriminated parts ({ type: "text" | "inlineData", ... })
  const fbContents = contents.map((c) => ({
    role: c.role,
    parts: c.parts.map((p) =>
      "text" in p ? { type: "text" as const, text: p.text } : { type: "inlineData" as const, inlineData: p.inlineData },
    ),
  }));
  const res = await model.generateContent({ contents: fbContents });
  return res.response.text();
}

async function viaGenAI({ system, contents, jsonSchema, temperature = 0.3 }: GenerateOptions) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction: system,
      temperature,
      ...(jsonSchema ? { responseMimeType: "application/json", responseJsonSchema: jsonSchema } : {}),
    },
  });
  return res.text ?? "";
}
