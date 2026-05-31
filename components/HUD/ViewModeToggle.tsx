"use client";

import { useGlobeStore } from "@/stores/useGlobeStore";
import type { ViewMode } from "@/stores/useGlobeStore";

const MODES: { value: ViewMode; label: string; description: string }[] = [
  { value: "satellite", label: "SAT", description: "Satellite imagery" },
  { value: "political", label: "POL", description: "Political map" },
  { value: "heatmap", label: "HEAT", description: "Density heatmap" },
];

export function ViewModeToggle() {
  const mode = useGlobeStore((s) => s.viewMode);
  const setMode = useGlobeStore((s) => s.setViewMode);

  return (
    <div className="flex items-center gap-1 rounded-md border border-cyan-400/15 bg-[rgba(4,6,12,0.7)] p-0.5 backdrop-blur-md">
      {MODES.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => setMode(m.value)}
          title={m.description}
          className={`rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest transition ${
            mode === m.value
              ? "bg-cyan-400/20 text-cyan-100"
              : "text-cyan-100/55 hover:text-cyan-100"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
