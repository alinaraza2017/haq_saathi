import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useLang } from "../lib/i18n";
import { useCase } from "../lib/caseStore";
import { followUp } from "../services/legal";
import { redact } from "../lib/redact";
import type { ChatMsg } from "../lib/types";

export default function Chat() {
  const { t, lang } = useLang();
  const { state, update } = useCase();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [state.chat.length, busy]);
  const a = state.analysis;
  if (!a) return <Navigate to="/" replace />;

  const send = async (q: string) => {
    const text = redact(q.trim());
    if (!text || busy) return;
    const history: ChatMsg[] = [...state.chat, { role: "user", text }];
    update({ chat: history });
    setInput("");
    setBusy(true);
    try {
      const reply = await followUp(a, history, lang);
      update({ chat: [...history, { role: "model", text: reply }] });
    } catch (e) {
      console.error(e);
      update({ chat: [...history, { role: "model", text: t("error") }] });
    } finally {
      setBusy(false);
    }
  };

  const suggestions =
    lang === "ur"
      ? ["اگر انہوں نے بدلہ لیا تو کیا ہوگا؟", "کیا مجھے وکیل کی ضرورت ہے؟", "اس میں کتنا وقت لگے گا؟"]
      : ["What if they retaliate?", "Do I need a lawyer?", "How long will this take?"];

  return (
    <div className="flex min-h-[70dvh] flex-col gap-3">
      <Link to="/results" className="text-sm text-teal-800 underline">← {t("back")}</Link>
      <h1 className="text-2xl font-bold text-teal-900">💬 {t("askFollowUp")}</h1>
      <div className="flex-1 space-y-3">
        {state.chat.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full bg-teal-50 px-4 py-2 text-sm text-teal-900 ring-1 ring-teal-900/10">
                {s}
              </button>
            ))}
          </div>
        )}
        {state.chat.map((m, i) => (
          <div
            key={i}
            dir="auto"
            className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 ${
              m.role === "user" ? "ms-auto bg-teal-800 text-cream" : "me-auto bg-white shadow-sm ring-1 ring-teal-900/5"
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && <div className="me-auto rounded-3xl bg-white px-4 py-3 text-teal-800/70 shadow-sm">{t("thinking")}</div>}
        <div ref={end} />
      </div>
      <p className="text-center text-xs text-amber-900">⚠️ {t("disclaimer")}</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-3 flex gap-2 rounded-3xl bg-white p-2 shadow-lg ring-1 ring-teal-900/10"
      >
        <input
          dir="auto"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chatPlaceholder")}
          className="min-w-0 flex-1 rounded-2xl bg-transparent px-3 focus:outline-none"
        />
        <button disabled={busy || !input.trim()} className="btn-primary !py-2">{t("send")}</button>
      </form>
    </div>
  );
}
