"use client";

import { useMemo, useState } from "react";
import { CATEGORY_COLORS, Cluster } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Props {
  clusters: Cluster[];
}

function projectStereographic(
  lat: number,
  lng: number,
  pole: "N" | "S",
  size: number,
): { x: number; y: number } | null {
  const phi = (lat * Math.PI) / 180;
  if (pole === "N" && phi < Math.PI / 6) return null;
  if (pole === "S" && phi > -Math.PI / 6) return null;
  const r =
    pole === "N"
      ? (Math.PI / 2 - phi) / (Math.PI / 3)
      : (Math.PI / 2 + phi) / (Math.PI / 3);
  const theta = (lng * Math.PI) / 180;
  const x = size / 2 + (r * size * 0.45) * Math.cos(theta);
  const y =
    size / 2 +
    (r * size * 0.45) * (pole === "N" ? Math.sin(theta) : -Math.sin(theta));
  return { x, y };
}

function PolarView({
  clusters,
  pole,
  size = 110,
}: {
  clusters: Cluster[];
  pole: "N" | "S";
  size?: number;
}) {
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);

  const points = useMemo(() => {
    return clusters
      .map((c) => {
        const proj = projectStereographic(c.lat, c.lng, pole, size);
        if (!proj) return null;
        return { ...proj, cluster: c };
      })
      .filter((p): p is { x: number; y: number; cluster: Cluster } => !!p);
  }, [clusters, pole, size]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-cyan-300/60">
        {pole === "N" ? "North" : "South"}
      </span>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-[88px] w-[88px] rounded-full border border-cyan-400/15 bg-[rgba(4,6,12,0.7)]"
      >
        <defs>
          <radialGradient id={`polar-glow-${pole}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(34, 211, 238, 0.18)" />
            <stop offset="80%" stopColor="rgba(34, 211, 238, 0)" />
          </radialGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.45}
          fill={`url(#polar-glow-${pole})`}
          stroke="rgba(56,189,248,0.25)"
          strokeWidth="0.6"
        />
        {[0.15, 0.3, 0.45].map((r) => (
          <circle
            key={r}
            cx={size / 2}
            cy={size / 2}
            r={size * r}
            fill="none"
            stroke="rgba(56,189,248,0.08)"
            strokeWidth="0.4"
          />
        ))}
        {[0, 45, 90, 135].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const dx = (Math.cos(rad) * size) / 2.2;
          const dy = (Math.sin(rad) * size) / 2.2;
          return (
            <line
              key={deg}
              x1={size / 2 - dx}
              y1={size / 2 - dy}
              x2={size / 2 + dx}
              y2={size / 2 + dy}
              stroke="rgba(56,189,248,0.06)"
              strokeWidth="0.4"
            />
          );
        })}
        {points.map(({ x, y, cluster }) => (
          <circle
            key={cluster.id}
            cx={x}
            cy={y}
            r={1.2 + cluster.intensity * 2}
            fill={CATEGORY_COLORS[cluster.category]}
            opacity={0.85}
            style={{ cursor: "pointer" }}
            onClick={() => {
              selectCluster(cluster.id);
              flyTo(cluster.lat, cluster.lng);
            }}
          />
        ))}
      </svg>
      <span className="font-mono text-[8px] uppercase tracking-wider text-cyan-100/40">
        {points.length} clusters
      </span>
    </div>
  );
}

export function PolarMinimap({ clusters }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="font-mono text-[10px] uppercase tracking-widest text-cyan-200/65 hover:text-cyan-100"
      >
        Show poles
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <PolarView clusters={clusters} pole="N" />
      <PolarView clusters={clusters} pole="S" />
    </div>
  );
}
