"use client";

import { useMemo } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { CATEGORY_COLORS } from "@/lib/types";

function fmtCoord(v: number, axis: "lat" | "lng"): string {
  const dir =
    axis === "lat" ? (v >= 0 ? "N" : "S") : v >= 0 ? "E" : "W";
  const abs = Math.abs(v);
  const deg = Math.floor(abs);
  const min = Math.floor((abs - deg) * 60);
  const sec = ((abs - deg) * 60 - min) * 60;
  return `${deg}°${min.toString().padStart(2, "0")}'${sec.toFixed(1).padStart(4, "0")}"${dir}`;
}

function regionFromLatLng(lat: number, lng: number): string {
  if (lat > 66.5) return "Arctic";
  if (lat < -60) return "Antarctic";
  if (lat > 35 && lng > -10 && lng < 60) return "Europe";
  if (lat < 35 && lat > -35 && lng > -20 && lng < 55) return "Africa";
  if (lat > 5 && lng > 25 && lng < 180) return "Asia";
  if (lat < 5 && lat > -50 && lng > 95 && lng < 180) return "Oceania";
  if (lat > 15 && lng < -50 && lng > -170) return "North America";
  if (lat < 15 && lng < -30 && lng > -85) return "South America";
  return "Open ocean";
}

export function CoordinateReadout() {
  const coords = useGlobeStore((s) => s.hoveredCoords);
  const clusters = useGlobeStore((s) => s.clusters);
  const country = useGlobeStore((s) => s.hoveredCountry);

  const nearest = useMemo(() => {
    if (!coords) return null;
    let best = null;
    let bestDist = Infinity;
    for (const c of clusters) {
      const dLat = c.lat - coords.lat;
      const dLng = c.lng - coords.lng;
      const d = dLat * dLat + dLng * dLng;
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    return best ? { cluster: best, dist: Math.sqrt(bestDist) } : null;
  }, [coords, clusters]);

  const active = !!coords;

  return (
    <div className="pointer-events-none absolute top-32 left-72 z-20 w-56">
      <div
        className={`rounded-lg border bg-[rgba(4,6,12,0.78)] backdrop-blur-xl transition-opacity ${
          active ? "border-cyan-400/25 opacity-100" : "border-cyan-400/10 opacity-50"
        }`}
      >
        <div className="border-b border-cyan-400/10 px-3 py-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/65">
            Cursor track
          </span>
        </div>
        <div className="space-y-1.5 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-100/45">
              Lat
            </span>
            <span className="font-mono text-[11px] text-cyan-100 tabular-nums">
              {coords ? fmtCoord(coords.lat, "lat") : "--°--'--\"-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-100/45">
              Lng
            </span>
            <span className="font-mono text-[11px] text-cyan-100 tabular-nums">
              {coords ? fmtCoord(coords.lng, "lng") : "--°--'--\"-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-100/45">
              Region
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-50">
              {coords ? regionFromLatLng(coords.lat, coords.lng) : "--"}
            </span>
          </div>
          {country && (
            <div className="flex items-center justify-between border-t border-cyan-400/10 pt-1.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-100/45">
                Country
              </span>
              <span className="line-clamp-1 max-w-[140px] font-mono text-[10px] uppercase tracking-wider text-cyan-50">
                {country}
              </span>
            </div>
          )}
          {nearest && (
            <div className="mt-1 border-t border-cyan-400/10 pt-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[nearest.cluster.category],
                    boxShadow: `0 0 6px ${CATEGORY_COLORS[nearest.cluster.category]}`,
                  }}
                />
                <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-300/65">
                  Nearest
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-cyan-50/85">
                {nearest.cluster.dominantTitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
