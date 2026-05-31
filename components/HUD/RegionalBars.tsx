"use client";

import { useMemo } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Region {
  name: string;
  test: (lat: number, lng: number) => boolean;
  color: string;
}

const REGIONS: Region[] = [
  {
    name: "N. America",
    color: "#60a5fa",
    test: (lat, lng) => lat > 15 && lng < -50 && lng > -170,
  },
  {
    name: "S. America",
    color: "#a78bfa",
    test: (lat, lng) => lat < 15 && lng < -30 && lng > -85,
  },
  {
    name: "Europe",
    color: "#34d399",
    test: (lat, lng) => lat > 35 && lng > -10 && lng < 60,
  },
  {
    name: "Africa",
    color: "#fbbf24",
    test: (lat, lng) => lat < 35 && lat > -35 && lng > -20 && lng < 55,
  },
  {
    name: "Middle East",
    color: "#fb923c",
    test: (lat, lng) =>
      lat >= 12 && lat <= 42 && lng >= 25 && lng <= 65,
  },
  {
    name: "Asia",
    color: "#f472b6",
    test: (lat, lng) => lat > 5 && lng > 65 && lng < 180,
  },
  {
    name: "Oceania",
    color: "#22d3ee",
    test: (lat, lng) => lat < 5 && lat > -50 && lng > 95 && lng < 180,
  },
];

export function RegionalBars() {
  const clusters = useGlobeStore((s) => s.clusters);

  const counts = useMemo(() => {
    const result = REGIONS.map((r) => ({
      ...r,
      count: 0,
      clusterCount: 0,
    }));
    for (const c of clusters) {
      for (let i = 0; i < REGIONS.length; i++) {
        if (REGIONS[i].test(c.lat, c.lng)) {
          result[i].count += c.events.length;
          result[i].clusterCount += 1;
          break;
        }
      }
    }
    return result;
  }, [clusters]);

  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div className="grid h-full grid-cols-7 gap-1 px-2">
      {counts.map((r) => (
        <div
          key={r.name}
          className="flex flex-col rounded border border-zinc-800/70 bg-[#0a0b0e] px-1.5 py-1"
        >
          <div className="flex items-center gap-1">
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{ background: r.color }}
            />
            <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-400">
              {r.name}
            </span>
          </div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span
              className="font-mono text-sm leading-none tabular-nums"
              style={{ color: r.color }}
            >
              {r.count}
            </span>
            <span className="font-mono text-[8px] text-zinc-500 tabular-nums">
              · {r.clusterCount} pin{r.clusterCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(r.count / max) * 100}%`,
                background: r.color,
                boxShadow: `0 0 4px ${r.color}`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
