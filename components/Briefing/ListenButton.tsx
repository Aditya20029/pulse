"use client";

import { useEffect, useState } from "react";

interface Props {
  text: string;
}

export function ListenButton({ text }: Props) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" && "speechSynthesis" in window,
    );
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !text) return null;

  const speak = () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.02;
    utter.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /Samantha|Daniel|Google US English|Microsoft.*English/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utter.voice = preferred;
    utter.onend = () => setPlaying(false);
    utter.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utter);
    setPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={playing ? "Stop reading" : "Listen to briefing"}
      title={playing ? "Stop reading" : "Listen to briefing"}
      className="rounded border border-cyan-400/25 bg-cyan-400/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/15"
    >
      {playing ? "Stop" : "Listen"}
    </button>
  );
}
