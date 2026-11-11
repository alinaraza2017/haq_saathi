import { useEffect, useState } from "react";
import { useLang } from "../lib/i18n";

function pickVoice(prefix: string) {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
}

/** Reads Urdu with an ur-PK / ur voice if the device has one; otherwise falls back to the English text. */
export default function ReadAloud({ ur, en }: { ur: string; en: string }) {
  const { lang, t } = useLang();
  const [speaking, setSpeaking] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => {
    window.speechSynthesis?.getVoices(); // warm up voice list (async on Chrome)
    return () => window.speechSynthesis?.cancel();
  }, []);
  if (!("speechSynthesis" in window)) return null;

  const speak = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const urVoice = pickVoice("ur-pk") || pickVoice("ur");
    const useUrdu = lang === "ur" && !!urVoice;
    setNote(lang === "ur" && !urVoice ? "No Urdu voice on this device — reading English." : "");
    const u = new SpeechSynthesisUtterance(useUrdu ? ur : en);
    if (useUrdu) {
      u.voice = urVoice!;
      u.lang = urVoice!.lang;
    } else {
      u.lang = "en-US";
      const enVoice = pickVoice("en-in") || pickVoice("en");
      if (enVoice) u.voice = enVoice;
    }
    u.rate = 0.92;
    u.onend = u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button onClick={speak} className="btn-ghost !py-2 !px-4 text-sm">
        {speaking ? "⏹ " + t("stop") : "🔊 " + t("readAloud")}
      </button>
      {note && <span className="text-xs text-teal-800/70 latin">{note}</span>}
    </div>
  );
}
