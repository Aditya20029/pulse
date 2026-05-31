"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_COLORS, Cluster } from "@/lib/types";
import { useGlobeStore } from "@/stores/useGlobeStore";

export function ClusterQueue() {
  const clusters = useGlobeStore((s) => s.clusters);
  const activeCategories = useGlobeStore((s) => s.activeCategories);
  const selectedClusterId = useGlobeStore((s) => s.selectedClusterId);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key !== "j" && e.key !== "k") return;
      setVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), 2400);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const upcoming: Cluster[] = useMemo(() => {
    const ordered = [...clusters]
      .filter((c) => activeCategories.has(c.category))
      .sort((a, b) => b.intensity - a.intensity);
    if (ordered.length === 0) return [];
    const idx = ordered.findIndex((c) => c.id === selectedClusterId);
    const start = idx >= 0 ? idx : -1;
    const next: Cluster[] = [];
    for (let i = 1; i <= 3; i++) {
      const k = (start + i + ordered.length) % ordered.length;
      next.push(ordered[k]);
    }
    return next;
  }, [clusters, activeCategories, selectedClusterId]);

  if (!visible || upcoming.length === 0) return null;

  return (
    <div className="pointer-events-none absolute left-1/2 top-32 z-30 -translate-x-1/2 rounded-lg border border-cyan-400/25 bg-[rgba(4,6,12,0.92)] px-3 py-2 backdrop-blur-xl">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-cyan-300/65">
          Next in queue
        </span>
        <kbd className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1 font-mono text-[9px] tracking-widest text-cyan-100">
          J/K
        </kbd>
      </div>
      <div className="flex items-center gap-2">
        {upcoming.map((c, i) => (
          <div
            key={c.id}
            className="flex max-w-[160px] items-center gap-1.5 rounded border border-cyan-400/10 bg-white/[0.02] px-2 py-1"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <span
              className="block h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background: CATEGORY_COLORS[c.category],
                boxShadow: `0 0 6px ${CATEGORY_COLORS[c.category]}`,
              }}
            />
            <span className="line-clamp-1 text-[10px] text-cyan-50/95">
              {c.dominantTitle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
