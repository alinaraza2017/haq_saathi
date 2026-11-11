import { lazy, Suspense } from "react";
import { NavLink, Route, Routes, Link } from "react-router-dom";
import QuickExit from "./components/QuickExit";
import { useLang } from "./lib/i18n";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Complaint from "./pages/Complaint";
import Chat from "./pages/Chat";
import Help from "./pages/Help";
const Impact = lazy(() => import("./pages/Impact"));


export default function App() {
  const { lang, setLang, t } = useLang();
  const nav = [
    ["/", t("home")],
    ["/help", t("help")],
    ["/impact", t("impact")],
  ] as const;
  return (
    <div className="min-h-dvh bg-cream">
      <QuickExit />
      <header className="sticky top-0 z-40 bg-teal-800 text-cream shadow-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 pe-36" dir="ltr">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block font-bold latin">Haq Saathi</span>
              <span className="block text-sm urdu urdu-tight -mt-1">حق ساتھی</span>
            </span>
          </Link>
          <button
            onClick={() => setLang(lang === "ur" ? "en" : "ur")}
            className="ms-auto rounded-full bg-teal-700 px-3 py-1.5 text-sm font-semibold ring-1 ring-cream/30"
            aria-label="Toggle language"
          >
            {lang === "ur" ? <span className="latin">English</span> : <span className="urdu urdu-tight">اردو</span>}
          </button>
        </div>
        <nav className="mx-auto flex max-w-2xl gap-1 px-3 pb-2 text-sm">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `rounded-full px-3 py-1 ${isActive ? "bg-cream text-teal-900" : "text-cream/85 hover:bg-teal-700"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className={`mx-auto max-w-2xl px-4 pb-16 pt-5 ${lang === "ur" ? "urdu" : "latin"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/help" element={<Help />} />
          <Route path="/impact" element={<Suspense fallback={<p>…</p>}><Impact /></Suspense>} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
