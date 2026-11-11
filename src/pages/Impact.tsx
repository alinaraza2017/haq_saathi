import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLang, CATEGORY_LABELS } from "../lib/i18n";
import { DEMO_STATS, fetchStats, type StatRecord } from "../services/stats";
import { isFirebaseConfigured } from "../services/firebase";

const DEMO_COLOR = "#d9c48f";
const REAL_COLOR = "#146262";

function group(records: StatRecord[], key: "category" | "city", label: (k: string) => string) {
  const m = new Map<string, { name: string; demo: number; real: number }>();
  for (const r of records) {
    const k = r[key] || "Other";
    const row = m.get(k) ?? { name: label(k), demo: 0, real: 0 };
    r.demo ? row.demo++ : row.real++;
    m.set(k, row);
  }
  return [...m.values()].sort((a, b) => b.demo + b.real - (a.demo + a.real));
}

export default function Impact() {
  const { t, lang } = useLang();
  const [real, setReal] = useState<StatRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "off" | "error">(isFirebaseConfigured ? "loading" : "off");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    fetchStats()
      .then((r) => {
        setReal(r);
        setStatus("ok");
      })
      .catch((e) => {
        console.error(e);
        setStatus("error");
      });
  }, []);

  const all = useMemo(() => [...DEMO_STATS, ...real], [real]);
  const byCat = useMemo(() => group(all, "category", (k) => CATEGORY_LABELS[k]?.[lang] ?? k), [all, lang]);
  const byCity = useMemo(() => group(all, "city", (k) => k), [all]);
  const emergencies = all.filter((r) => r.urgency === "emergency").length;

  const legend = { demo: t("demoData"), real: t("realData") };
  const tooltipFmt = (v: unknown, n: unknown) => [String(v), legend[n as "demo" | "real"] ?? String(n)] as [string, string];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-teal-900">📊 {t("impactTitle")}</h1>
      <p className="text-sm text-teal-900/80">{t("impactSub")}</p>

      <div dir="ltr" className="rounded-2xl border-2 border-dashed border-sand bg-cream-dark/60 p-3 text-xs text-teal-950 latin">
        <strong>DEMO DATA NOTICE:</strong> {DEMO_STATS.length} records below are seeded demo data for the hackathon
        presentation and do not represent real people. Real opt-in records: <strong>{real.length}</strong>
        {status === "off" && " (Firestore not configured)"}
        {status === "error" && " (could not load Firestore)"}
        {status === "loading" && " (loading…)"}.
      </div>

      <div className="grid grid-cols-3 gap-3 text-center latin">
        {[
          [all.length, lang === "ur" ? "کل" : "Total"],
          [byCity.length, lang === "ur" ? "شہر" : "Cities"],
          [emergencies, lang === "ur" ? "ایمرجنسی" : "Emergencies"],
        ].map(([v, l]) => (
          <div key={String(l)} className="card !p-3">
            <div className="text-2xl font-bold text-teal-800">{v}</div>
            <div className={`text-xs text-teal-900/70 ${lang === "ur" ? "urdu urdu-tight" : ""}`}>{l}</div>
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="mb-2 font-bold text-teal-900">{t("byCategory")}</h2>
        <div className="h-72 latin" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCat} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="#0b3d3d14" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fontFamily: lang === "ur" ? "Noto Nastaliq Urdu" : "Inter" }}
              />
              <Tooltip formatter={tooltipFmt} />
              <Legend formatter={(v) => legend[v as "demo" | "real"]} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="demo" stackId="a" fill={DEMO_COLOR} radius={[0, 0, 0, 0]} />
              <Bar dataKey="real" stackId="a" fill={REAL_COLOR} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-2 font-bold text-teal-900">{t("byCity")}</h2>
        <div className="h-72 latin" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCity} margin={{ left: -16, right: 8 }}>
              <CartesianGrid vertical={false} stroke="#0b3d3d14" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={56} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={tooltipFmt} />
              <Legend formatter={(v) => legend[v as "demo" | "real"]} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="demo" stackId="a" fill={DEMO_COLOR} />
              <Bar dataKey="real" stackId="a" fill={REAL_COLOR} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
