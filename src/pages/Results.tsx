import { Link, Navigate } from "react-router-dom";
import { useLang, CATEGORY_LABELS } from "../lib/i18n";
import { useCase } from "../lib/caseStore";
import EmergencyBanner from "../components/EmergencyBanner";
import ReadAloud from "../components/ReadAloud";
import { lawById } from "../lib/types";
import type { ReactNode } from "react";

function Section({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-teal-900">
        <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-lg">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Results() {
  const { t, lang } = useLang();
  const { state } = useCase();
  const a = state.analysis;
  if (!a) return <Navigate to="/" replace />;
  const ur = lang === "ur";
  const steps = ur ? a.next_steps_ur : a.next_steps;
  const evidence = ur ? a.evidence_checklist_ur : a.evidence_checklist;
  const laws = a.applicable_law_ids.map(lawById).filter((l) => !!l);
  const urgencyStyle =
    a.urgency === "emergency" ? "bg-red-100 text-red-800" : a.urgency === "high" ? "bg-amber-100 text-amber-900" : "bg-teal-50 text-teal-800";

  return (
    <div className="space-y-4">
      {a.urgency === "emergency" && <EmergencyBanner />}

      {state.offline && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-900">{t("offlineNote")}</p>}

      <Section icon="💬" title={t("summary")}>
        <div className="mb-3 flex flex-wrap gap-2 text-xs latin">
          <span className="rounded-full bg-teal-800 px-3 py-1 text-cream">
            {CATEGORY_LABELS[a.category]?.[lang] ?? a.category}
          </span>
          <span className={`rounded-full px-3 py-1 font-semibold uppercase ${urgencyStyle}`}>{a.urgency}</span>
        </div>
        <p dir="auto">{ur ? a.summary_ur : a.summary_en}</p>
        <div className="mt-3">
          <ReadAloud
            ur={`${a.summary_ur} ${a.rights_explained_ur} ${a.next_steps_ur.join("۔ ")}`}
            en={`${a.summary_en} ${a.rights_explained_en} ${a.next_steps.join(". ")}`}
          />
        </div>
      </Section>

      <Section icon="⚖️" title={t("yourRights")}>
        <p dir="auto" className="mb-4">
          {ur ? a.rights_explained_ur : a.rights_explained_en}
        </p>
        <div className="space-y-3">
          {laws.map((l) => (
            <article key={l.id} className="rounded-2xl bg-cream/70 p-4 ring-1 ring-teal-900/10">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-700 latin" dir="ltr">
                {l.section}
              </p>
              <h3 className="font-semibold text-teal-950" dir="auto">
                {ur ? l.law_ur : l.law}
              </h3>
              <p className="mt-1 text-sm" dir="auto">
                {ur ? l.summary_ur : l.summary_en}
              </p>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer font-semibold text-teal-800">{t("howToFile")}</summary>
                <p className="mt-1" dir="auto">
                  {ur ? l.how_to_file_ur : l.how_to_file}
                </p>
              </details>
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                ⚠️ {t("disclaimer")}
                {!l.verified && <span className="block opacity-75">{t("unverified")}</span>}
              </p>
            </article>
          ))}
          {laws.length === 0 && <p className="text-sm text-teal-800/70">{t("disclaimer")}</p>}
        </div>
      </Section>

      <Section icon="🏛️" title={t("whereToGo")}>
        <p dir="auto" className="font-semibold">
          {ur ? a.forum_ur : a.forum}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="tel:1099" className="btn-ghost !py-2 text-sm">📞 1099</a>
          <Link to="/help" className="btn-ghost !py-2 text-sm">{t("help")} →</Link>
        </div>
      </Section>

      <Section icon="🪜" title={t("nextSteps")}>
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-800 text-sm font-bold text-cream latin">
                {i + 1}
              </span>
              <span dir="auto">{s}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section icon="📁" title={t("evidence")}>
        <ul className="space-y-2">
          {evidence.map((s, i) => (
            <li key={i}>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-2 h-5 w-5 shrink-0 accent-teal-700" />
                <span dir="auto">{s}</span>
              </label>
            </li>
          ))}
        </ul>
      </Section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/complaint" className="btn-primary text-lg">📝 {t("draftComplaint")}</Link>
        <Link to="/chat" className="btn-ghost text-lg">💬 {t("askFollowUp")}</Link>
      </div>
      <p className="text-center text-xs text-teal-800/70">{t("disclaimer")}</p>
      <div className="text-center">
        <Link to="/" className="text-sm text-teal-800 underline">{t("startOver")}</Link>
      </div>
    </div>
  );
}
