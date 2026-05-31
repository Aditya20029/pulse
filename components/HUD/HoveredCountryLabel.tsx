"use client";

import { useEffect, useMemo, useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

export function HoveredCountryLabel() {
  const country = useGlobeStore((s) => s.hoveredCountry);
  const clusters = useGlobeStore((s) => s.clusters);
  const selectRegion = useGlobeStore((s) => s.selectRegion);

  // small debounce so labels don't flicker when crossing borders
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setShown(country), country ? 0 : 200);
    return () => clearTimeout(t);
  }, [country]);

  const eventCount = useMemo(() => {
    if (!shown) return 0;
    return clusters.reduce(
      (sum, c) => sum + (c.events.length > 0 ? 0 : 0),
      0,
    );
  }, [shown, clusters]);

  if (!shown) return null;

  return (
    <button
      type="button"
      onClick={() => selectRegion(shown)}
      className="pointer-events-auto group rounded-md border border-zinc-700/60 bg-[#0a0b0e]/95 px-4 py-2 shadow-[0_4px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition hover:border-lime-400/40"
      title={`Open region briefing for ${shown}`}
    >
      <div className="flex items-center gap-2.5">
        <span className="block h-1.5 w-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.9)]" />
        <div className="text-left">
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
            Hovering
          </div>
          <div className="mt-0.5 text-base font-semibold leading-tight text-zinc-100">
            {shown}
          </div>
        </div>
        <span className="ml-3 font-mono text-[9px] uppercase tracking-widest text-zinc-500 opacity-0 transition group-hover:opacity-100">
          Click to drill in →
        </span>
      </div>
      {/* eventCount placeholder for future use */}
      <span className="hidden">{eventCount}</span>
    </button>
  );
}
