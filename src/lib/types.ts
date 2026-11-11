import lawsData from "../data/laws.json";
import helplinesData from "../data/helplines.json";

export type Lang = "ur" | "en";
export type Urgency = "emergency" | "high" | "normal";

export const CATEGORIES = [
  "workplace_harassment",
  "domestic_violence",
  "cyber_harassment",
  "property_inheritance",
  "family_maintenance_khula",
  "street_harassment",
  "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Law = (typeof lawsData)[number];
export type Helpline = (typeof helplinesData)[number];

export const LAWS: Law[] = lawsData;
export const HELPLINES: Helpline[] = helplinesData;
export const LAW_IDS = LAWS.map((l) => l.id);
export const lawById = (id: string) => LAWS.find((l) => l.id === id);

export interface Analysis {
  category: Category;
  urgency: Urgency;
  summary_ur: string;
  summary_en: string;
  applicable_law_ids: string[];
  rights_explained_ur: string;
  rights_explained_en: string;
  forum: string;
  forum_ur: string;
  next_steps: string[];
  next_steps_ur: string[];
  evidence_checklist: string[];
  evidence_checklist_ur: string[];
}

export interface ComplaintDraft {
  letter_en: string;
  letter_ur: string;
}

export interface ChatMsg {
  role: "user" | "model";
  text: string;
}

export const CITIES = [
  "Islamabad",
  "Lahore",
  "Karachi",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Other",
] as const;
