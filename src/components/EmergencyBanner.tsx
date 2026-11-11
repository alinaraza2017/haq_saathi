import { useLang } from "../lib/i18n";

export default function EmergencyBanner() {
  const { t } = useLang();
  return (
    <div role="alert" className="rounded-3xl bg-red-700 p-5 text-white shadow-lg ring-4 ring-red-200">
      <p className="text-lg font-bold">⚠️ {t("emergencyTitle")}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a href="tel:15" className="btn bg-white text-red-700 text-lg">
          📞 {t("callPolice")}
        </a>
        <a href="tel:1099" className="btn bg-red-900 text-white text-lg ring-1 ring-white/40">
          ⚖️ {t("callLegal")}
        </a>
      </div>
      <a href="tel:1043" className="mt-3 block text-center text-sm underline opacity-90 latin">
        Punjab Women Helpline 1043 (24/7) · Rescue 1122
      </a>
    </div>
  );
}
