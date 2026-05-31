"use client";

import { useMemo } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

const BUCKETS = 48;

export function VelocitySparkline() {
  const clusters = useGlobeStore((s) => s.clusters);

  const { points, total, peak, currentRate } = useMemo(() => {
    const now = Date.now();
    const counts = new Array(BUCKETS).fill(0);
    let total = 0;
    for (const c of clusters) {
      for (const e of c.events) {
        if (!e.datetime) continue;
        const ms = new Date(e.datetime).getTime();
        const half = (now - ms) / (30 * 60 * 1000); // 30-min buckets
        if (half < 0 || half >= BUCKETS) continue;
        const idx = BUCKETS - 1 - Math.floor(half);
        counts[idx] += 1;
        total += 1;
      }
    }
    const peak = Math.max(...counts, 1);
    const lastFew = counts.slice(-4).reduce((s, v) => s + v, 0);
    const currentRate = lastFew / 2; // per hour, last 2h average
    return { points: counts, total, peak, currentRate };
  }, [clusters]);

  const w = 360;
  const h = 26;
  const stepX = w / (BUCKETS - 1);
  const path = points
    .map((v, i) => {
      const x = i * stepX;
      const y = h - (v / peak) * (h - 2);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="flex items-center gap-3 rounded-md border border-zinc-800/70 bg-[#0a0b0e] px-3 py-2">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
          Velocity / 24h
        </div>
        <div className="font-mono text-lg leading-none text-lime-300 tabular-nums">
          {currentRate.toFixed(1)}<span className="text-[10px] text-zinc-500">/h</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-7 flex-1" preserveAspectRatio="none">
        <defs>
          <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(163, 230, 53, 0.35)" />
            <stop offset="100%" stopColor="rgba(163, 230, 53, 0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#velocityFill)" />
        <path
          d={path}
          fill="none"
          stroke="#a3e635"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="text-right">
        <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-500">
          24h total
        </div>
        <div className="font-mono text-lg leading-none text-zinc-100 tabular-nums">
          {total}
        </div>
      </div>
    </div>
  );
}
