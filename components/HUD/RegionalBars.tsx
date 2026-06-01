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
    <div className="flex h-full w-full items-center gap-2 px-1">
      <div className="hidden shrink-0 flex-col pr-1 sm:flex">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-500">
          Regional
        </span>
        <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-600">
          events by continent
        </span>
      </div>
      <div className="grid h-full w-full flex-1 grid-cols-7 gap-2">
        {counts.map((r) => (
          <div
            key={r.name}
            className="flex flex-col justify-between rounded border border-zinc-800/70 bg-[#0a0b0e] px-2.5 py-2"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="block h-2 w-2 rounded-full"
                style={{ background: r.color, boxShadow: `0 0 5px ${r.color}` }}
              />
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400">
                {r.name}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span
                className="font-mono text-lg leading-none tabular-nums"
                style={{ color: r.color }}
              >
                {r.count}
              </span>
              <span className="font-mono text-[9px] text-zinc-500 tabular-nums">
                {r.clusterCount} pin{r.clusterCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(r.count / max) * 100}%`,
                  background: r.color,
                  boxShadow: `0 0 5px ${r.color}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
