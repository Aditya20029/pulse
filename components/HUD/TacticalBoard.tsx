"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { useGlobeStore } from "@/stores/useGlobeStore";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Quake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
}

interface QuakeResponse {
  quakes: Quake[];
}

function Tile({
  label,
  value,
  sub,
  accent = "#a3e635",
  alert = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  alert?: boolean;
}) {
  return (
    <div
      className="flex flex-1 flex-col rounded border bg-[#0a0b0e] px-2 py-1.5"
      style={{
        borderColor: alert ? "rgba(251, 146, 60, 0.4)" : "rgba(39, 39, 42, 0.7)",
      }}
    >
      <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-zinc-500">
        {label}
      </span>
      <span
        className="mt-0.5 font-mono text-base leading-none tabular-nums"
        style={{ color: alert ? "#fb923c" : accent }}
      >
        {value}
      </span>
      {sub && (
        <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-zinc-500">
          {sub}
        </span>
      )}
    </div>
  );
}

export function TacticalBoard() {
  const clusters = useGlobeStore((s) => s.clusters);
  const { data: quakeData } = useSWR<QuakeResponse>(
    "/api/data/earthquakes",
    fetcher,
    { refreshInterval: 10 * 60 * 1000 },
  );

  const stats = useMemo(() => {
    const quakes = quakeData?.quakes ?? [];
    const significantQuakes = quakes.filter((q) => q.magnitude >= 5).length;
    const maxQuake = quakes.reduce(
      (m, q) => Math.max(m, q.magnitude),
      0,
    );

    let conflictActivity = 0;
    let envActivity = 0;
    let critical = 0;
    let totalEvents = 0;
    const distinctSources = new Set<string>();
    for (const c of clusters) {
      totalEvents += c.events.length;
      if (c.category === "conflict") conflictActivity += c.events.length;
      if (c.category === "environment" || c.category === "wildlife")
        envActivity += c.events.length;
      if (c.intensity >= 0.7) critical += 1;
      for (const e of c.events) {
        if (e.source) distinctSources.add(e.source);
      }
    }

    return {
      quakes: quakes.length,
      significantQuakes,
      maxQuake,
      conflictActivity,
      envActivity,
      critical,
      totalEvents,
      sourceCount: distinctSources.size,
    };
  }, [clusters, quakeData]);

  return (
    <div className="flex h-full flex-col gap-1.5 overflow-y-auto">
      <div className="rounded border border-zinc-800/70 bg-[#0a0b0e] px-2 py-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-500">
            Tactical
          </span>
          <span className="flex items-center gap-1">
            <span className="relative flex h-1 w-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-400 opacity-60" />
              <span className="relative inline-flex h-1 w-1 rounded-full bg-lime-400" />
            </span>
            <span className="font-mono text-[7px] uppercase tracking-widest text-lime-300/85">
              Live
            </span>
          </span>
        </div>
      </div>

      <Tile
        label="Earthquakes 24h"
        value={String(stats.quakes)}
        sub={`max M${stats.maxQuake.toFixed(1)}`}
        accent="#fbbf24"
        alert={stats.maxQuake >= 6}
      />
      <Tile
        label="M5+ events"
        value={String(stats.significantQuakes)}
        sub="significant"
        accent="#fb923c"
        alert={stats.significantQuakes > 3}
      />
      <Tile
        label="Conflict events"
        value={String(stats.conflictActivity)}
        sub="tracked 24h"
        accent="#ef4444"
        alert={stats.conflictActivity > 50}
      />
      <Tile
        label="Climate / wildlife"
        value={String(stats.envActivity)}
        sub="tracked 24h"
        accent="#22c55e"
      />
      <Tile
        label="Critical clusters"
        value={String(stats.critical)}
        sub="intensity ≥ 0.7"
        accent="#a3e635"
        alert={stats.critical >= 5}
      />
      <Tile
        label="Distinct outlets"
        value={String(stats.sourceCount)}
        sub="reporting now"
        accent="#22d3ee"
      />
      <Tile
        label="Total events"
        value={stats.totalEvents.toLocaleString()}
        sub="globally tracked"
        accent="#a3e635"
      />
    </div>
  );
}
