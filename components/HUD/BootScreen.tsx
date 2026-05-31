"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Initializing WebGL context",
  "Loading Blue Marble textures (8K)",
  "Connecting to GDELT global feed",
  "Aggregating Reddit + RSS + HN",
  "Geocoding event clusters",
  "Arming intelligence engine",
];

export function BootScreen() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 420);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="w-[320px]">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-lime-400/15">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-lime-400" />
            </span>
          </div>
          <div>
            <div className="font-mono text-lg font-bold tracking-[0.4em] text-zinc-100">
              PULSE
            </div>
            <div className="font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-500">
              Global News Intelligence
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="flex h-3 w-3 items-center justify-center font-mono text-[10px]"
                style={{
                  color:
                    i < step ? "#a3e635" : i === step ? "#22d3ee" : "#3f3f46",
                }}
              >
                {i < step ? "✓" : i === step ? "▸" : "·"}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{
                  color:
                    i < step ? "#71717a" : i === step ? "#a1a1aa" : "#3f3f46",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 h-0.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-lime-400 transition-all duration-300"
            style={{
              width: `${((step + 1) / STEPS.length) * 100}%`,
              boxShadow: "0 0 8px rgba(163,230,53,0.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
