import { useLang } from "../lib/i18n";
import { HELPLINES } from "../lib/types";

export default function Help() {
  const { t, lang } = useLang();
  const ur = lang === "ur";
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-teal-900">📞 {t("helpTitle")}</h1>
      <div className="space-y-3">
        {HELPLINES.map((h) => (
          <a
            key={h.id}
            href={`tel:${h.tel}`}
            className={`card flex items-center gap-4 transition active:scale-[0.99] ${h.emergency ? "ring-2 ring-red-200" : ""}`}
          >
            <span
              className={`flex h-16 min-w-16 shrink-0 items-center justify-center rounded-2xl px-2 text-lg font-bold latin ${
                h.emergency ? "bg-red-700 text-white" : "bg-teal-800 text-cream"
              }`}
              dir="ltr"
            >
              {h.number.length > 5 ? "☎" : h.number}
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-teal-950">{ur ? h.name_ur : h.name_en}</span>
              <span className="block text-sm text-teal-900/80">{ur ? h.desc_ur : h.desc_en}</span>
              <span className="mt-1 block text-sm font-semibold text-teal-700 latin" dir="ltr">
                {h.number} · {h.hours}
              </span>
            </span>
            <span aria-hidden className="text-2xl">📲</span>
          </a>
        ))}
      </div>
      <p className="text-xs text-teal-800/70">{t("disclaimer")}</p>
    </div>
  );
}
