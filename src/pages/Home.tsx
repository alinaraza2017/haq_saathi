import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { useCase } from "../lib/caseStore";
import { useRecorder, type Recording } from "../lib/useRecorder";
import { redact } from "../lib/redact";
import { analyze, type AnalyzeInput } from "../services/legal";
import { shareStat } from "../services/stats";
import { DEMO_SCENARIOS } from "../data/demoScenarios";
import { CITIES } from "../lib/types";

export default function Home() {
  const { t, lang } = useLang();
  const { update, reset } = useCase();
  const nav = useNavigate();
  const { recording, error: micError, start, stop } = useRecorder();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [city, setCity] = useState<string>("Lahore");

  async function run(input: AnalyzeInput, narrative: string) {
    setBusy(true);
    setError("");
    reset();
    try {
      let analysis;
      let offline = false;
      try {
        analysis = await analyze(input);
      } catch (e) {
        console.error(e);
        const demo = "text" in input ? DEMO_SCENARIOS.find((d) => redact(d.text) === input.text) : undefined;
        if (!demo) throw e;
        analysis = demo.fallback;
        offline = true;
      }
      update({ narrative, analysis, offline, complaint: null, chat: [] });
      if (optIn) {
        shareStat({ category: analysis.category, city, urgency: analysis.urgency }).catch(console.error);
      }
      nav("/results");
    } catch {
      setError(t("error"));
    } finally {
      setBusy(false);
    }
  }

  const submitText = () => {
    const clean = redact(text.trim());
    if (clean) run({ text: clean }, clean);
  };
  const onVoice = (r: Recording) => run({ audio: { base64: r.base64, mimeType: r.mimeType } }, `[voice note, ${r.seconds}s]`);

  return (
    <div className="space-y-6">
      <section className="pt-2 text-center">
        <h1 className="text-2xl font-bold text-teal-900">{t("tagline")}</h1>
      </section>

      {/* Big mic */}
      <section className="flex flex-col items-center gap-4">
        <button
          onClick={() => (recording ? stop() : start(onVoice))}
          disabled={busy}
          aria-label={t("speak")}
          className={`relative isolate flex h-48 w-48 items-center justify-center rounded-full text-cream shadow-xl transition active:scale-95 disabled:opacity-60 ${
            recording ? "pulse-ring bg-coral" : "bg-teal-800 hover:bg-teal-700"
          }`}
        >
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {recording ? (
              <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
            ) : (
              <>
                <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
              </>
            )}
          </svg>
        </button>
        <p className="urdu text-3xl font-bold text-teal-900" dir="rtl">
          {recording ? t("listening") : "اپنی بات بتائیں"}
        </p>
        {lang === "en" && !recording && <p className="-mt-3 text-teal-800/80">{t("speak")}</p>}
        <p className="text-center text-sm text-teal-800/70">{t("noNameHint")}</p>
        {micError && <p className="text-sm text-coral">{t("micDenied")}</p>}
      </section>

      {/* Text alternative */}
      <section className="card space-y-3">
        <label htmlFor="story" className="block text-sm font-semibold text-teal-900">
          {t("orType")}
        </label>
        <textarea
          id="story"
          dir="auto"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          className="w-full resize-y rounded-2xl border-0 bg-cream/60 p-4 text-base ring-1 ring-teal-900/10 focus:ring-2 focus:ring-teal-600 focus:outline-none"
        />
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-teal-800/70 latin">
            🎬 {t("demo")}
          </label>
          <select
            className="w-full rounded-xl bg-teal-50 p-3 text-sm ring-1 ring-teal-900/10"
            value=""
            onChange={(e) => {
              const d = DEMO_SCENARIOS.find((s) => s.id === e.target.value);
              if (d) setText(d.text);
            }}
          >
            <option value="">{t("demoPick")}</option>
            {DEMO_SCENARIOS.map((d) => (
              <option key={d.id} value={d.id}>
                {lang === "ur" ? d.title_ur : d.title_en}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 rounded-xl bg-cream/60 p-3 text-sm">
          <input type="checkbox" className="mt-1.5 h-5 w-5 accent-teal-700" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} />
          <span>{t("optIn")}</span>
        </label>
        {optIn && (
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl bg-teal-50 p-3 text-sm latin" aria-label={t("city")}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}

        <button onClick={submitText} disabled={busy || !text.trim()} className="btn-primary w-full text-lg">
          {busy ? t("analyzing") : t("analyze")}
        </button>
        {error && <p className="text-sm text-coral">{error}</p>}
      </section>

      {busy && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-cream/90 backdrop-blur-sm">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
          <p className="text-lg font-semibold text-teal-900">{t("analyzing")}</p>
        </div>
      )}

      <p className="flex items-start gap-2 rounded-2xl bg-teal-50 p-4 text-sm text-teal-900">
        <span aria-hidden>🔒</span>
        <span>{t("privacy")}</span>
      </p>
    </div>
  );
}
