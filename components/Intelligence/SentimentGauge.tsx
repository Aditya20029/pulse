"use client";

import { useMemo } from "react";
import { Cluster } from "@/lib/types";

interface Props {
  clusters: Cluster[];
}

export function SentimentGauge({ clusters }: Props) {
  const { avgTone, eventCount } = useMemo(() => {
    let toneSum = 0;
    let total = 0;
    for (const c of clusters) {
      for (const e of c.events) {
        toneSum += e.tone;
        total += 1;
      }
    }
    return {
      avgTone: total === 0 ? 0 : toneSum / total,
      eventCount: total,
    };
  }, [clusters]);

  const clamped = Math.max(-10, Math.min(10, avgTone));
  const angleDeg = (clamped / 10) * 90;
  const labelColor =
    clamped < -2 ? "#ef4444" : clamped > 2 ? "#22c55e" : "#fbbf24";
  const labelText =
    clamped < -2
      ? "Negative"
      : clamped > 2
        ? "Positive"
        : "Neutral";

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 70" className="h-16 w-28 shrink-0">
        <defs>
          <linearGradient id="sentimentArc" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="url(#sentimentArc)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        {Array.from({ length: 11 }).map((_, i) => {
          const a = (-Math.PI / 2) + (Math.PI * i) / 10;
          const x1 = 60 + Math.cos(a) * 44;
          const y1 = 60 + Math.sin(a) * 44;
          const x2 = 60 + Math.cos(a) * 52;
          const y2 = 60 + Math.sin(a) * 52;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth="0.8"
            />
          );
        })}
        <g
          transform={`translate(60, 60) rotate(${angleDeg})`}
          style={{ transition: "transform 0.8s ease" }}
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-45"
            stroke={labelColor}
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#glow)"
          />
          <circle cx="0" cy="0" r="3" fill={labelColor} />
        </g>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>
      </svg>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-xl text-cyan-50 tabular-nums"
            style={{ color: labelColor }}
          >
            {clamped >= 0 ? "+" : ""}
            {clamped.toFixed(2)}
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-widest"
            style={{ color: labelColor }}
          >
            {labelText}
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-100/45">
          Avg tone, {eventCount} events
        </div>
      </div>
    </div>
  );
}
