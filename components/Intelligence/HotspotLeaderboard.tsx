"use client";

import { useMemo } from "react";
import { CATEGORY_COLORS, Cluster } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Props {
  clusters: Cluster[];
}

function regionLabel(lat: number, lng: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lng).toFixed(1)}°${ew}`;
}

export function HotspotLeaderboard({ clusters }: Props) {
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);

  const top = useMemo(() => {
    return [...clusters]
      .sort((a, b) => b.events.length - a.events.length)
      .slice(0, 5);
  }, [clusters]);

  if (top.length === 0) return null;

  const max = top[0].events.length;

  return (
    <div className="space-y-1.5">
      {top.map((c, i) => (
        <button
          key={c.id}
          type="button"
          onClick={() => {
            selectCluster(c.id);
            flyTo(c.lat, c.lng);
          }}
          className="group flex w-full items-center gap-2 rounded border border-cyan-400/10 bg-white/[0.02] px-2.5 py-1.5 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
        >
          <span className="font-mono text-[10px] text-cyan-200/55 tabular-nums w-4">
            {i + 1}
          </span>
          <span
            className="block h-2 w-2 shrink-0 rounded-full"
            style={{
              background: CATEGORY_COLORS[c.category],
              boxShadow: `0 0 6px ${CATEGORY_COLORS[c.category]}`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="truncate text-[11px] text-cyan-50/95">
              {c.dominantTitle}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-200/45">
                {regionLabel(c.lat, c.lng)}
              </span>
              <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-cyan-400/8">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${(c.events.length / max) * 100}%`,
                    background: CATEGORY_COLORS[c.category],
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-cyan-100/85 tabular-nums">
                {c.events.length}
              </span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
