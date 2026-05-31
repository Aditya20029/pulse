"use client";

import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "Welcome to Pulse",
    body: "A real-time 3D intelligence globe. Breaking news clusters across the world, with Claude-powered analysis on every event.",
  },
  {
    title: "Click any cluster",
    body: "Glowing orbs are news clusters. Click one for a Claude briefing with summary, significance, connected events, and historical parallels.",
  },
  {
    title: "Click any country",
    body: "Click directly on the Earth (not a cluster) to drill into that country's full event feed.",
  },
  {
    title: "Time scrub",
    body: "The bottom slider lets you replay the last 24 hours. Hit play to auto-scrub, or REC to capture a 10s timelapse video.",
  },
  {
    title: "Switch view modes",
    body: "Top bar SAT / POL / HEAT switches between satellite, political, and heatmap views. Press V to cycle.",
  },
  {
    title: "Ask Claude anything",
    body: "The cyan bubble in the bottom right opens a chat. Claude knows what's on your globe and can answer questions about it.",
  },
  {
    title: "Shortcuts",
    body: "J/K to cycle clusters, / to focus search, Esc to close, Space to play time, ? for full reference.",
  },
];

const KEY = "pulse-onboarding-complete";

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = window.localStorage.getItem(KEY);
    if (!done) {
      setTimeout(() => setActive(true), 1500);
    }
  }, []);

  const finish = () => {
    setActive(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(KEY, "1");
    }
  };

  if (!active) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      data-screenshot-hide="true"
      className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-md"
    >
      <div className="w-[480px] rounded-lg border border-cyan-400/30 bg-[rgba(4,6,12,0.97)] p-6 shadow-[0_0_80px_-15px_rgba(0,240,255,0.6)]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/65">
            Tour {step + 1} of {STEPS.length}
          </span>
          <div className="flex flex-1 gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i <= step ? "bg-cyan-400" : "bg-cyan-400/15"
                }`}
              />
            ))}
          </div>
        </div>
        <h2 className="mt-3 text-xl font-semibold leading-tight text-cyan-50">
          {current.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-cyan-50/80">
          {current.body}
        </p>
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={finish}
            className="font-mono text-[10px] uppercase tracking-widest text-cyan-100/55 hover:text-cyan-100"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded border border-cyan-400/25 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/10"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isLast) finish();
                else setStep((s) => s + 1);
              }}
              className="rounded border border-cyan-300/50 bg-cyan-400/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-cyan-50 hover:bg-cyan-400/25"
            >
              {isLast ? "Get started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
