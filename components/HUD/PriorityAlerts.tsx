"use client";

import { useMemo } from "react";
import { CATEGORY_COLORS, Cluster } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Props {
  clusters: Cluster[];
}

function severityLabel(intensity: number): { text: string; color: string } {
  if (intensity > 0.7) return { text: "CRITICAL", color: "#ef4444" };
  if (intensity > 0.45) return { text: "HIGH", color: "#fb923c" };
  return { text: "MED", color: "#fbbf24" };
}

export function PriorityAlerts({ clusters }: Props) {
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);

  const top = useMemo(() => {
    return [...clusters]
      .filter((c) => c.category === "conflict" || c.intensity > 0.4)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 4);
  }, [clusters]);

  if (top.length === 0) {
    return (
      <div className="rounded border border-emerald-400/20 bg-emerald-500/5 px-3 py-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-emerald-300/80">
          No critical alerts
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {top.map((c) => {
        const sev = severityLabel(c.intensity);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              selectCluster(c.id);
              flyTo(c.lat, c.lng);
            }}
            className="group block w-full rounded border border-red-500/15 bg-red-500/5 px-2.5 py-1.5 text-left transition hover:border-red-400/45 hover:bg-red-500/10"
          >
            <div className="flex items-center gap-2">
              <span
                className="rounded px-1 font-mono text-[8px] font-bold tracking-widest"
                style={{
                  color: sev.color,
                  border: `1px solid ${sev.color}55`,
                  background: `${sev.color}10`,
                }}
              >
                {sev.text}
              </span>
              <span
                className="block h-1.5 w-1.5 rounded-full"
                style={{
                  background: CATEGORY_COLORS[c.category],
                  boxShadow: `0 0 6px ${CATEGORY_COLORS[c.category]}`,
                }}
              />
              <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-200/55">
                {c.events.length} events
              </span>
            </div>
            <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-cyan-50/95">
              {c.dominantTitle}
            </div>
          </button>
        );
      })}
    </div>
  );
}
