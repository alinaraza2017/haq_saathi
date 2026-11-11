import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { useCase } from "../lib/caseStore";
import { draftComplaint } from "../services/legal";
import { lawById, type Analysis, type ComplaintDraft } from "../lib/types";

type Which = "en" | "ur";
const FIELDS = ["YOUR NAME", "CNIC", "ADDRESS", "PHONE", "DATE"] as const;

/** Offline template so the demo never shows an empty screen if the AI is unreachable. */
function localTemplate(a: Analysis): ComplaintDraft {
  const laws = a.applicable_law_ids.map(lawById).filter((l) => !!l);
  return {
    letter_en: `To,
${a.forum}

Subject: Complaint regarding ${a.category.replace(/_/g, " ")}

Respected Sir/Madam,

I, [YOUR NAME], holder of CNIC No. [CNIC], resident of [ADDRESS], respectfully submit as follows:

1. ${a.summary_en}

2. These acts are covered by: ${laws.map((l) => `${l.law}, ${l.section}`).join("; ")}.

3. I request that you take notice of this complaint, conduct an inquiry, provide me protection from any retaliation, and grant all relief available under the law.

Annexures:
${a.evidence_checklist.map((e, i) => `  ${String.fromCharCode(65 + i)}. ${e}`).join("\n")}

Yours faithfully,

[YOUR NAME]
CNIC: [CNIC]
Phone: [PHONE]
Address: [ADDRESS]
Date: [DATE]`,
    letter_ur: `بخدمت جناب
${a.forum_ur}

عنوان: شکایت

جناب عالی،

میں، [YOUR NAME]، شناختی کارڈ نمبر [CNIC]، ساکن [ADDRESS]، نہایت ادب سے عرض کرتی ہوں کہ:

1۔ ${a.summary_ur}

2۔ یہ افعال درج ذیل قوانین کے تحت آتے ہیں: ${laws.map((l) => `${l.law_ur}، ${l.section}`).join("؛ ")}۔

3۔ استدعا ہے کہ اس شکایت پر کارروائی کی جائے، انکوائری کی جائے، مجھے کسی بھی انتقامی کارروائی سے تحفظ دیا جائے اور قانون کے مطابق داد رسی کی جائے۔

منسلکات:
${a.evidence_checklist_ur.map((e, i) => `  ${i + 1}۔ ${e}`).join("\n")}

العارضہ،

[YOUR NAME]
شناختی کارڈ: [CNIC]
فون: [PHONE]
پتہ: [ADDRESS]
تاریخ: [DATE]`,
  };
}

export default function Complaint() {
  const { t, lang } = useLang();
  const { state, update } = useCase();
  const a = state.analysis;
  const [which, setWhich] = useState<Which>(lang);
  const [drafts, setDrafts] = useState<ComplaintDraft | null>(state.complaint);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  // Personal details: component state only — never persisted, never sent anywhere.
  const [details, setDetails] = useState<Record<string, string>>({
    DATE: new Date().toLocaleDateString("en-GB"),
  });

  const requested = useRef(false);
  useEffect(() => {
    if (!a || drafts || requested.current) return;
    requested.current = true;
    setBusy(true);
    draftComplaint(a, state.narrative)
      .catch((e) => {
        console.error(e);
        return localTemplate(a);
      })
      .then((d) => {
        setDrafts(d);
        update({ complaint: d });
      })
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a]);

  if (!a) return <Navigate to="/" replace />;

  const key = which === "en" ? "letter_en" : "letter_ur";
  const letter = drafts?.[key] ?? "";
  const setLetter = (v: string) => drafts && setDrafts({ ...drafts, [key]: v });

  const applyDetails = () => {
    if (!drafts) return;
    const fill = (s: string) =>
      FIELDS.reduce((acc, f) => (details[f]?.trim() ? acc.split(`[${f}]`).join(details[f].trim()) : acc), s);
    // Filled version is kept only in memory (not saved to sessionStorage).
    setDrafts({ letter_en: fill(drafts.letter_en), letter_ur: fill(drafts.letter_ur) });
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(letter, 595 - 144);
    let y = 72;
    for (const line of lines) {
      if (y > 842 - 72) {
        doc.addPage();
        y = 72;
      }
      doc.text(line, 72, y);
      y += 17;
    }
    doc.save("complaint.pdf");
  };

  return (
    <div className="space-y-4">
      <Link to="/results" className="text-sm text-teal-800 underline">← {t("back")}</Link>
      <h1 className="text-2xl font-bold text-teal-900">📝 {t("draftComplaint")}</h1>

      <section className="card space-y-3">
        <p className="text-sm text-teal-900">🔒 {t("fillLocal")}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 latin" dir="ltr">
          {FIELDS.map((f) => (
            <input
              key={f}
              value={details[f] ?? ""}
              onChange={(e) => setDetails({ ...details, [f]: e.target.value })}
              placeholder={f === "CNIC" ? "CNIC (xxxxx-xxxxxxx-x)" : f.charAt(0) + f.slice(1).toLowerCase()}
              autoComplete="off"
              className="rounded-xl bg-cream/60 p-3 text-sm ring-1 ring-teal-900/10 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          ))}
        </div>
        <button onClick={applyDetails} disabled={!drafts} className="btn-ghost w-full">
          {t("apply")}
        </button>
      </section>

      <section className="card space-y-3">
        <div className="flex gap-2" role="tablist">
          {(["en", "ur"] as const).map((w) => (
            <button
              key={w}
              role="tab"
              aria-selected={which === w}
              onClick={() => setWhich(w)}
              className={`flex-1 rounded-xl py-2 font-semibold ${which === w ? "bg-teal-800 text-cream" : "bg-teal-50 text-teal-900"}`}
            >
              {w === "en" ? t("english") : t("urdu")}
            </button>
          ))}
        </div>
        {busy ? (
          <div className="flex items-center gap-3 p-6 text-teal-900">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
            {t("generating")}
          </div>
        ) : (
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            dir={which === "ur" ? "rtl" : "ltr"}
            rows={20}
            className={`w-full rounded-2xl bg-cream/60 p-4 text-sm ring-1 ring-teal-900/10 focus:ring-2 focus:ring-teal-600 focus:outline-none ${
              which === "ur" ? "urdu" : "latin"
            }`}
          />
        )}
        <div className="grid grid-cols-2 gap-2">
          {which === "en" ? (
            <button onClick={downloadPdf} disabled={!letter} className="btn-primary">⬇️ {t("downloadPdf")}</button>
          ) : (
            <button onClick={() => window.print()} disabled={!letter} className="btn-primary">🖨️ {t("print")}</button>
          )}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(letter);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="btn-ghost"
          >
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <p className="text-xs text-amber-900">⚠️ {t("disclaimer")}</p>
      </section>

      <div className={`print-area hidden print:block ${which === "ur" ? "urdu" : "latin"}`} dir={which === "ur" ? "rtl" : "ltr"}>
        {letter}
      </div>
    </div>
  );
}
