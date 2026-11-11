import { useRef, useState } from "react";

export interface Recording {
  base64: string;
  mimeType: string;
  seconds: number;
}

function pickMime() {
  const opts = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return opts.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) || "";
}

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export function useRecorder(maxSeconds = 120) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const started = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  async function start(onDone: (r: Recording) => void) {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearTimeout(timer.current);
        setRecording(false);
        const type = (mr.mimeType || mime || "audio/webm").split(";")[0];
        const blob = new Blob(chunks, { type });
        if (blob.size < 1000) return;
        onDone({ base64: await toBase64(blob), mimeType: type, seconds: Math.round((Date.now() - started.current) / 1000) });
      };
      rec.current = mr;
      started.current = Date.now();
      mr.start();
      setRecording(true);
      timer.current = window.setTimeout(() => mr.state === "recording" && mr.stop(), maxSeconds * 1000);
    } catch (e) {
      setError(String(e));
      setRecording(false);
    }
  }
  function stop() {
    if (rec.current?.state === "recording") rec.current.stop();
  }
  return { recording, error, start, stop };
}
