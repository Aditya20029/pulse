"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

const SUGGESTIONS = [
  "What's the biggest story right now?",
  "Anything happening in Asia I should know about?",
  "What's the overall tone today?",
  "Which conflict zone is most active?",
];

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: { [i: number]: { transcript: string } };
    length: number;
  };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechCtor(): { new (): SpeechRecognitionLike } | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: { new (): SpeechRecognitionLike };
    webkitSpeechRecognition?: { new (): SpeechRecognitionLike };
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function AskClaude() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const startVoice = () => {
    const Ctor = getSpeechCtor();
    if (!Ctor) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setInput(transcript);
        setTimeout(() => send(transcript), 80);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const clusters = useGlobeStore((s) => s.clusters);
  const selectedClusterId = useGlobeStore((s) => s.selectedClusterId);
  const selectedRegion = useGlobeStore((s) => s.selectedRegion);
  const timeScrubHoursAgo = useGlobeStore((s) => s.timeScrubHoursAgo);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const userMsg: Message = {
      role: "user",
      content: trimmed,
      id: `${Date.now()}-u`,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/news/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          clusters,
          selectedClusterId,
          selectedRegion,
          timeScrubHoursAgo,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply: string };
      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        id: `${Date.now()}-a`,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Couldn't reach the AI. Try again.",
          id: `${Date.now()}-err`,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-screenshot-hide="true"
        className="pointer-events-auto absolute bottom-20 right-4 z-30 flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/15 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan-100 shadow-[0_0_30px_-10px_rgba(0,240,255,0.6)] backdrop-blur-xl hover:bg-cyan-400/25"
        aria-label="Ask Claude"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
        Ask Claude
      </button>
    );
  }

  return (
    <div
      data-screenshot-hide="true"
      className="pointer-events-auto absolute bottom-20 right-4 z-30 flex h-[520px] w-[400px] flex-col rounded-lg border border-cyan-400/25 bg-[rgba(4,6,12,0.95)] backdrop-blur-2xl shadow-[0_0_60px_-15px_rgba(0,240,255,0.45)]"
    >
      <div className="flex items-center justify-between border-b border-cyan-400/15 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-100">
              Ask Claude
            </h3>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-100/45">
              Opus 4.7 with live globe context
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
          className="rounded-full border border-cyan-400/20 px-2 py-0.5 font-mono text-xs text-cyan-200 hover:bg-cyan-400/10"
        >
          ×
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3"
      >
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[12px] leading-snug text-cyan-100/65">
              Ask anything about what is on the globe. Claude can see all visible clusters, your selection, and your time scrub.
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded border border-cyan-400/15 bg-cyan-400/5 px-2.5 py-1.5 text-left text-[11px] text-cyan-100/85 hover:border-cyan-400/35 hover:bg-cyan-400/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-lg px-3 py-2 text-[12px] leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-cyan-400/15 text-cyan-50"
                : "border border-cyan-400/15 bg-white/[0.02] text-cyan-50/90"
            }`}
          >
            {m.content}
          </div>
        ))}
        {pending && (
          <div className="flex items-center gap-1.5 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan-300/60">
            <span className="h-1 w-1 animate-pulse rounded-full bg-cyan-300" />
            <span
              className="h-1 w-1 animate-pulse rounded-full bg-cyan-300"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="h-1 w-1 animate-pulse rounded-full bg-cyan-300"
              style={{ animationDelay: "0.4s" }}
            />
            <span className="ml-2">Thinking</span>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-cyan-400/10 p-3"
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startVoice}
            title={listening ? "Stop listening" : "Voice input"}
            aria-label={listening ? "Stop listening" : "Voice input"}
            className={`rounded-md border px-2 py-1.5 transition ${
              listening
                ? "border-red-400/50 bg-red-500/15 text-red-200 animate-pulse"
                : "border-cyan-400/25 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/15"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={listening ? "Listening..." : "Ask about what's happening..."}
            className="flex-1 rounded-md border border-cyan-400/20 bg-[rgba(4,6,12,0.7)] px-3 py-1.5 text-[12px] text-cyan-50 placeholder:text-cyan-100/35 focus:border-cyan-300/55 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            className="rounded-md border border-cyan-300/40 bg-cyan-400/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-100 hover:bg-cyan-400/25 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
