import { useEffect } from "react";
import { useLang } from "../lib/i18n";

export function quickExit() {
  try {
    window.speechSynthesis?.cancel();
    sessionStorage.clear();
    localStorage.clear();
  } catch {
    /* ignore */
  }
  // replace() so the Back button does not return to this app
  window.location.replace("https://www.google.com/search?q=weather");
}

export default function QuickExit() {
  const { t } = useLang();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && quickExit();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <button
      onClick={quickExit}
      title={t("quickExitHint")}
      aria-label="Quick exit — leave this site immediately (Esc)"
      className="fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full bg-coral px-4 py-2.5 text-sm font-bold text-white shadow-lg ring-2 ring-white active:scale-95 latin"
      style={{ top: "max(0.75rem, env(safe-area-inset-top))" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
      {t("quickExit")}
    </button>
  );
}
