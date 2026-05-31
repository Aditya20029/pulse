"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_COLORS, Cluster } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

interface Toast {
  id: string;
  cluster: Cluster;
  expires: number;
}

const TOAST_DURATION = 12_000;
const PRIORITY_THRESHOLD = 0.55;

export function NotificationStream() {
  const clusters = useGlobeStore((s) => s.clusters);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && clusters.length > 0) {
      for (const c of clusters) seenIdsRef.current.add(c.id);
      initializedRef.current = true;
      return;
    }

    const newOnes: Cluster[] = [];
    for (const c of clusters) {
      if (!seenIdsRef.current.has(c.id) && c.intensity >= PRIORITY_THRESHOLD) {
        newOnes.push(c);
      }
      seenIdsRef.current.add(c.id);
    }
    if (newOnes.length === 0) return;
    const now = Date.now();
    const newToasts = newOnes.slice(0, 3).map((c) => ({
      id: `${c.id}-${now}`,
      cluster: c,
      expires: now + TOAST_DURATION,
    }));
    setToasts((prev) => [...newToasts, ...prev].slice(0, 4));
  }, [clusters]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const id = setInterval(() => {
      const now = Date.now();
      setToasts((prev) => prev.filter((t) => t.expires > now));
    }, 500);
    return () => clearInterval(id);
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute right-[440px] top-20 z-30 flex w-72 flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            selectCluster(t.cluster.id);
            flyTo(t.cluster.lat, t.cluster.lng);
            setToasts((prev) => prev.filter((x) => x.id !== t.id));
          }}
          className="pointer-events-auto group animate-[notification-slide_0.4s_ease-out] overflow-hidden rounded-lg border border-cyan-400/25 bg-[rgba(4,6,12,0.92)] px-3 py-2 text-left backdrop-blur-xl shadow-[0_0_30px_-10px_rgba(0,240,255,0.5)] hover:border-cyan-300/55"
        >
          <div className="flex items-center gap-2">
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{
                background: CATEGORY_COLORS[t.cluster.category],
                boxShadow: `0 0 8px ${CATEGORY_COLORS[t.cluster.category]}`,
              }}
            />
            <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-red-300">
              New alert
            </span>
            <span className="font-mono text-[8px] uppercase tracking-wider text-cyan-200/55">
              {t.cluster.events.length} events
            </span>
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-cyan-50">
            {t.cluster.dominantTitle}
          </div>
        </button>
      ))}
    </div>
  );
}
