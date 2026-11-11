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
/** Tried in order when the previous model is rate-limited (each model has its own free-tier quota). */
export const FALLBACK_MODELS: string[] = (import.meta.env.VITE_GEMINI_FALLBACK_MODELS || "gemini-3.6-flash,gemini-3.5-flash-lite")
  .split(",")
  .map((m: string) => m.trim())
  .filter(Boolean);
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
  const models = [MODEL, ...FALLBACK_MODELS.filter((m) => m !== MODEL)];
  let lastErr: unknown;
  for (const model of models) {
    try {
      return await (PROVIDER === "firebase" ? viaFirebase(opts, model) : viaGenAI(opts, model));
    } catch (e) {
      lastErr = e;
      if (!isRetryable(e)) throw e;
      console.warn(`[ai] ${model} unavailable (rate limit/overload) — trying next model`);
    }
  }
  throw lastErr;
}

/** 429 quota / 503 overload. In browsers a 429 often surfaces as a CORS "Failed to fetch". */
function isRetryable(e: unknown) {
  const msg = String((e as Error)?.message ?? e);
  return /429|quota|RESOURCE_EXHAUSTED|503|overloaded|UNAVAILABLE|Failed to fetch|NetworkError/i.test(msg);
}

export async function generateJSON<T>(opts: GenerateOptions & { jsonSchema: Record<string, unknown> }): Promise<T> {
  const text = await generate(opts);
  return JSON.parse(stripFences(text)) as T;
}

function stripFences(s: string) {
  return s.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/, "").trim();
}

async function viaFirebase({ system, contents, jsonSchema, temperature = 0.3 }: GenerateOptions, modelName: string) {
  const { getAI, getGenerativeModel, GoogleAIBackend } = await import("firebase/ai");
  const ai = getAI(getFirebaseApp()!, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: modelName,
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

async function viaGenAI({ system, contents, jsonSchema, temperature = 0.3 }: GenerateOptions, modelName: string) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const res = await ai.models.generateContent({
    model: modelName,
    contents,
    config: {
      systemInstruction: system,
      temperature,
      ...(jsonSchema ? { responseMimeType: "application/json", responseJsonSchema: jsonSchema } : {}),
    },
  });
  return res.text ?? "";
}
