import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./types";

const S = {
  appName: { en: "Haq Saathi", ur: "حق ساتھی" },
  tagline: {
    en: "Know your rights. Speak in your own words.",
    ur: "اپنے حقوق جانیں۔ اپنی زبان میں بات کریں۔",
  },
  speak: { en: "Tell us what happened", ur: "اپنی بات بتائیں" },
  speakUr: { en: "اپنی بات بتائیں", ur: "اپنی بات بتائیں" },
  listening: { en: "Listening… tap to stop", ur: "سن رہے ہیں… روکنے کے لیے دبائیں" },
  orType: { en: "or type it here", ur: "یا یہاں لکھیں" },
  placeholder: {
    en: "e.g. My manager keeps sending me inappropriate messages and says I'll lose my job if I complain…",
    ur: "مثلاً میرا مینیجر مجھے نامناسب پیغامات بھیجتا ہے اور کہتا ہے کہ شکایت کی تو نوکری چلی جائے گی…",
  },
  analyze: { en: "Get guidance", ur: "رہنمائی حاصل کریں" },
  analyzing: { en: "Understanding your situation…", ur: "آپ کی صورتحال سمجھ رہے ہیں…" },
  privacy: {
    en: "Your name is never sent to AI. No login. Nothing is saved unless you choose to share anonymous stats.",
    ur: "آپ کا نام کبھی بھی AI کو نہیں بھیجا جاتا۔ کوئی لاگ اِن نہیں۔ کچھ محفوظ نہیں ہوتا جب تک آپ گمنام اعداد و شمار شیئر کرنے کا انتخاب نہ کریں۔",
  },
  noNameHint: {
    en: "Tip: you don't need to say your name or anyone's CNIC.",
    ur: "مشورہ: اپنا نام یا کسی کا شناختی کارڈ نمبر بتانے کی ضرورت نہیں۔",
  },
  demo: { en: "Demo scenarios", ur: "ڈیمو کہانیاں" },
  demoPick: { en: "Try a sample story…", ur: "ایک نمونہ کہانی آزمائیں…" },
  quickExit: { en: "Quick Exit", ur: "فوری باہر" },
  quickExitHint: { en: "Press Esc anytime", ur: "کسی بھی وقت Esc دبائیں" },
  optIn: {
    en: "Share anonymous category & city for research",
    ur: "تحقیق کے لیے گمنام زمرہ اور شہر شیئر کریں",
  },
  city: { en: "City", ur: "شہر" },
  emergencyTitle: {
    en: "You may be in danger. Please call for help now.",
    ur: "آپ خطرے میں ہو سکتی ہیں۔ براہِ کرم ابھی مدد کے لیے کال کریں۔",
  },
  callPolice: { en: "Call 15 Police", ur: "15 پولیس کو کال کریں" },
  callLegal: { en: "Call 1099 Legal Help", ur: "1099 قانونی مدد" },
  summary: { en: "What we understood", ur: "ہم نے کیا سمجھا" },
  yourRights: { en: "Your Rights", ur: "آپ کے حقوق" },
  whereToGo: { en: "Where to Go", ur: "کہاں جائیں" },
  nextSteps: { en: "Next Steps", ur: "اگلے اقدامات" },
  evidence: { en: "Evidence to Collect", ur: "جمع کرنے کے ثبوت" },
  disclaimer: {
    en: "AI-generated guidance, not legal advice. Verify with 1099 or a lawyer.",
    ur: "یہ AI کی تیار کردہ رہنمائی ہے، قانونی مشورہ نہیں۔ 1099 یا وکیل سے تصدیق کریں۔",
  },
  unverified: { en: "Not yet verified against pakistancode.gov.pk", ur: "ابھی pakistancode.gov.pk سے تصدیق شدہ نہیں" },
  howToFile: { en: "How to file", ur: "شکایت کیسے کریں" },
  readAloud: { en: "Read aloud", ur: "سن لیں" },
  stop: { en: "Stop", ur: "روکیں" },
  draftComplaint: { en: "Draft my complaint", ur: "میری شکایت کا مسودہ" },
  askFollowUp: { en: "Ask a follow-up question", ur: "مزید سوال پوچھیں" },
  startOver: { en: "Start over", ur: "دوبارہ شروع کریں" },
  home: { en: "Home", ur: "ہوم" },
  help: { en: "Helplines", ur: "ہیلپ لائنز" },
  impact: { en: "Impact", ur: "اثر" },
  chat: { en: "Ask", ur: "سوال" },
  back: { en: "Back to results", ur: "نتائج پر واپس" },
  noCase: { en: "No case yet — tell us what happened first.", ur: "ابھی کوئی کیس نہیں — پہلے اپنی بات بتائیں۔" },
  generating: { en: "Writing your complaint…", ur: "آپ کی شکایت لکھی جا رہی ہے…" },
  fillLocal: {
    en: "Fill your details here. They stay on this phone and are never sent to AI.",
    ur: "اپنی تفصیل یہاں بھریں۔ یہ اسی فون پر رہتی ہے اور AI کو کبھی نہیں بھیجی جاتی۔",
  },
  apply: { en: "Insert my details", ur: "میری تفصیل شامل کریں" },
  downloadPdf: { en: "Download PDF", ur: "پی ڈی ایف ڈاؤن لوڈ" },
  print: { en: "Print / Save as PDF", ur: "پرنٹ / پی ڈی ایف محفوظ کریں" },
  copy: { en: "Copy", ur: "کاپی" },
  copied: { en: "Copied!", ur: "کاپی ہو گیا!" },
  english: { en: "English", ur: "انگریزی" },
  urdu: { en: "Urdu", ur: "اردو" },
  send: { en: "Send", ur: "بھیجیں" },
  chatPlaceholder: { en: "e.g. What if my employer fires me?", ur: "مثلاً اگر مالک مجھے نوکری سے نکال دے تو؟" },
  thinking: { en: "Thinking…", ur: "سوچ رہے ہیں…" },
  helpTitle: { en: "Help is one call away", ur: "مدد صرف ایک کال کی دوری پر" },
  error: { en: "Something went wrong. Please try again, or call 1099.", ur: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں یا 1099 پر کال کریں۔" },
  micDenied: { en: "Microphone not available — please type instead.", ur: "مائیک دستیاب نہیں — براہِ کرم لکھ دیں۔" },
  offlineNote: {
    en: "AI unavailable — showing prepared guidance for this demo story.",
    ur: "AI دستیاب نہیں — اس ڈیمو کہانی کی تیار شدہ رہنمائی دکھائی جا رہی ہے۔",
  },
  impactTitle: { en: "Impact dashboard", ur: "اثر کا ڈیش بورڈ" },
  impactSub: {
    en: "Anonymous, opt-in data only: category, city, urgency, time. No names, no stories.",
    ur: "صرف گمنام، رضاکارانہ ڈیٹا: زمرہ، شہر، فوری نوعیت، وقت۔ نہ نام، نہ کہانیاں۔",
  },
  byCategory: { en: "Cases by category", ur: "زمرے کے لحاظ سے" },
  byCity: { en: "Cases by city", ur: "شہر کے لحاظ سے" },
  demoData: { en: "Demo (seeded)", ur: "ڈیمو (نمونہ)" },
  realData: { en: "Real (opt-in)", ur: "اصل (رضاکارانہ)" },
  shared: { en: "Thank you — anonymous stats shared.", ur: "شکریہ — گمنام اعداد و شمار شیئر ہو گئے۔" },
  voiceNote: { en: "Voice recording ready", ur: "آواز ریکارڈ ہو گئی" },
  clear: { en: "Clear", ur: "صاف کریں" },
} as const;

export type StrKey = keyof typeof S;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: StrKey) => string;
}
const LangCtx = createContext<Ctx>(null!);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (sessionStorage.getItem("hs_lang") as Lang) || "ur");
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    sessionStorage.setItem("hs_lang", lang);
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: (k) => S[k][lang] }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

export const CATEGORY_LABELS: Record<string, { en: string; ur: string }> = {
  workplace_harassment: { en: "Workplace harassment", ur: "کام کی جگہ پر ہراسانی" },
  domestic_violence: { en: "Domestic violence", ur: "گھریلو تشدد" },
  cyber_harassment: { en: "Cyber harassment", ur: "سائبر ہراسانی" },
  property_inheritance: { en: "Property / inheritance", ur: "جائیداد / وراثت" },
  family_maintenance_khula: { en: "Maintenance / khula", ur: "نان نفقہ / خلع" },
  street_harassment: { en: "Public harassment", ur: "عوامی ہراسانی" },
  other: { en: "Other", ur: "دیگر" },
};
