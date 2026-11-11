import { generate, generateJSON, type Content } from "./ai";
import {
  CATEGORIES,
  HELPLINES,
  LAWS,
  LAW_IDS,
  type Analysis,
  type ChatMsg,
  type ComplaintDraft,
  lawById,
} from "../lib/types";

const KB = JSON.stringify(
  LAWS.map(({ id, law, section, jurisdiction, summary_en, forum, how_to_file }) => ({
    id,
    law,
    section,
    jurisdiction,
    summary_en,
    forum,
    how_to_file,
  })),
);
const HL = JSON.stringify(HELPLINES.map(({ number, name_en, desc_en }) => ({ number, name_en, desc_en })));

const BASE_RULES = `You are Haq Saathi (حق ساتھی), a calm, warm legal-rights companion for women in Pakistan.
You give plain-language legal INFORMATION (not legal advice), grounded ONLY in the knowledge base below.
Rules:
- Never invent laws, sections, punishments or forums that are not in the knowledge base. If unsure, say so and point to helpline 1099.
- Never ask for or repeat a person's name, CNIC, phone number or address.
- Be trauma-informed: validate feelings briefly, never blame the user, avoid graphic language.
- Urdu must be simple everyday Urdu in Urdu script (not Roman Urdu).
- If there is any risk to life, ongoing physical violence, threats to kill, sexual assault, suicide risk, or a child in danger, urgency is "emergency".

KNOWLEDGE BASE (laws.json):
${KB}

HELPLINES:
${HL}`;

const strArr = { type: "array", items: { type: "string" } };

export const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    category: { type: "string", enum: [...CATEGORIES] },
    urgency: { type: "string", enum: ["emergency", "high", "normal"] },
    summary_ur: { type: "string", description: "2-3 sentence summary of the situation in simple Urdu" },
    summary_en: { type: "string", description: "2-3 sentence summary in English" },
    applicable_law_ids: { type: "array", items: { type: "string", enum: LAW_IDS } },
    rights_explained_ur: { type: "string", description: "What rights she has, in simple Urdu, 3-5 sentences" },
    rights_explained_en: { type: "string" },
    forum: { type: "string", description: "The main place to go first, in English" },
    forum_ur: { type: "string" },
    next_steps: { ...strArr, description: "3-6 concrete ordered steps, English" },
    next_steps_ur: { ...strArr, description: "Same steps in Urdu" },
    evidence_checklist: { ...strArr, description: "3-6 evidence items, English" },
    evidence_checklist_ur: strArr,
  },
  required: [
    "category",
    "urgency",
    "summary_ur",
    "summary_en",
    "applicable_law_ids",
    "rights_explained_ur",
    "rights_explained_en",
    "forum",
    "forum_ur",
    "next_steps",
    "next_steps_ur",
    "evidence_checklist",
    "evidence_checklist_ur",
  ],
};

export type AnalyzeInput = { text: string } | { audio: { base64: string; mimeType: string } };

export async function analyze(input: AnalyzeInput): Promise<Analysis> {
  const parts: Content["parts"] =
    "text" in input
      ? [{ text: `Her account (may be Urdu, English or mixed):\n"""${input.text}"""` }]
      : [
          { text: "Her account is in this voice note (likely Urdu or mixed Urdu/English). Listen carefully." },
          { inlineData: { mimeType: input.audio.mimeType, data: input.audio.base64 } },
        ];
  parts.push({
    text: "Analyse her situation. Choose applicable_law_ids ONLY from the knowledge base ids. Prefer laws matching her province if mentioned. Return JSON only.",
  });
  const a = await generateJSON<Analysis>({
    system: BASE_RULES,
    contents: [{ role: "user", parts }],
    jsonSchema: ANALYSIS_SCHEMA,
    temperature: 0.2,
  });
  // Defence in depth: never show a law id that isn't in our knowledge base.
  a.applicable_law_ids = (a.applicable_law_ids || []).filter((id) => LAW_IDS.includes(id));
  if (!["emergency", "high", "normal"].includes(a.urgency)) a.urgency = "normal";
  return a;
}

const COMPLAINT_SCHEMA = {
  type: "object",
  properties: { letter_en: { type: "string" }, letter_ur: { type: "string" } },
  required: ["letter_en", "letter_ur"],
};

export async function draftComplaint(a: Analysis, narrative: string): Promise<ComplaintDraft> {
  const laws = a.applicable_law_ids.map((id) => lawById(id)).filter(Boolean);
  return generateJSON<ComplaintDraft>({
    system: BASE_RULES,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Write a formal complaint letter for her, addressed to the correct forum: "${a.forum}".
Case summary: ${a.summary_en}
Her words (redacted): ${narrative || "(voice note — use the summary)"}
Relevant laws: ${laws.map((l) => `${l!.law} — ${l!.section}`).join("; ")}

Requirements:
- Use EXACTLY these placeholders and never real-looking values: [YOUR NAME], [CNIC], [ADDRESS], [DATE], [PHONE]. Use [NAME OF ACCUSED] / [DATE OF INCIDENT] / [ORGANISATION] style placeholders for any other unknown detail.
- Structure: To / Subject / respectful salutation / facts in numbered paragraphs / legal basis citing the sections above / specific relief requested / list of annexures (evidence) / closing with signature block using placeholders.
- Factual, firm and respectful tone. No exaggeration. Do not invent facts beyond her account.
- letter_en in English; letter_ur is the same letter in formal Urdu (Urdu script), keeping the same placeholders in English brackets.`,
          },
        ],
      },
    ],
    jsonSchema: COMPLAINT_SCHEMA,
    temperature: 0.3,
  });
}

export async function followUp(a: Analysis, history: ChatMsg[], lang: "ur" | "en"): Promise<string> {
  const system = `${BASE_RULES}

CASE SUMMARY (already analysed):
${JSON.stringify({ category: a.category, urgency: a.urgency, summary: a.summary_en, laws: a.applicable_law_ids, forum: a.forum })}

Answer her follow-up questions about THIS case in ${lang === "ur" ? "simple Urdu (Urdu script)" : "simple English"}.
Keep answers short (under 120 words), practical, and cite law ids/sections from the knowledge base when relevant.
If a question is outside the knowledge base, say you are not sure and suggest calling 1099 or a lawyer. Never claim certainty about court outcomes.`;
  return generate({
    system,
    contents: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    temperature: 0.4,
  });
}
