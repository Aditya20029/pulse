"use client";

import { useMemo } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

const BUCKETS = 24;

export function SentimentTimeline() {
  const clusters = useGlobeStore((s) => s.clusters);

  const series = useMemo(() => {
    const now = Date.now();
    const sumByBucket = new Array(BUCKETS).fill(0);
    const countByBucket = new Array(BUCKETS).fill(0);
    for (const c of clusters) {
      for (const e of c.events) {
        if (!e.datetime) continue;
        const ms = new Date(e.datetime).getTime();
        const hoursAgo = (now - ms) / 3_600_000;
        if (hoursAgo < 0 || hoursAgo > BUCKETS) continue;
        const idx = Math.min(BUCKETS - 1, BUCKETS - 1 - Math.floor(hoursAgo));
        sumByBucket[idx] += e.tone;
        countByBucket[idx] += 1;
      }
    }
    return sumByBucket.map((s, i) =>
      countByBucket[i] > 0 ? s / countByBucket[i] : null,
    );
  }, [clusters]);

  const w = 280;
  const h = 36;
  const range = 10;
  const scale = (v: number) => h / 2 - (v / range) * (h / 2 - 2);

  const points = series
    .map((v, i) => ({
      x: (i / (BUCKETS - 1)) * w,
      y: v === null ? null : scale(v),
    }))
    .filter((p) => p.y !== null) as { x: number; y: number }[];

  const linePath =
    points.length === 0
      ? ""
      : `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ");

  const areaPath =
    points.length === 0
      ? ""
      : `M ${points[0].x} ${h} L ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ") +
        ` L ${points[points.length - 1].x} ${h} Z`;

  const latest = points[points.length - 1];
  const avg =
    points.length > 0
      ? points.reduce((s, p) => s + (h / 2 - p.y) / (h / 2 - 2) * range, 0) /
        points.length
      : 0;

  return (
    <div className="rounded-md border border-cyan-400/15 bg-[rgba(4,6,12,0.7)] px-3 py-1.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/65">
          Mood / 24h
        </span>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-9 flex-1"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
              <stop offset="50%" stopColor="rgba(251, 191, 36, 0.15)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.4)" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={h / 2}
            x2={w}
            y2={h / 2}
            stroke="rgba(56, 189, 248, 0.2)"
            strokeDasharray="2 3"
            strokeWidth="0.6"
          />
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#moodFill)"
              opacity="0.4"
            />
          )}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {latest && (
            <circle
              cx={latest.x}
              cy={latest.y}
              r="2.5"
              fill="#22d3ee"
            />
          )}
        </svg>
        <div className="text-right">
          <div
            className="font-mono text-xs tabular-nums"
            style={{
              color:
                avg < -1 ? "#ef4444" : avg > 1 ? "#22c55e" : "#fbbf24",
            }}
          >
            {avg >= 0 ? "+" : ""}
            {avg.toFixed(2)}
          </div>
          <div className="font-mono text-[8px] uppercase tracking-widest text-cyan-100/40">
            Avg
          </div>
        </div>
      </div>
    </div>
  );
}
