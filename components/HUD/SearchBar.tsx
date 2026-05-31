"use client";

import { useMemo, useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { useBookmarksStore } from "@/stores/useBookmarksStore";
import { CATEGORY_COLORS, Cluster } from "@/lib/types";
import { fuzzyScore } from "@/lib/fuzzy";

interface Match {
  cluster: Cluster;
  excerpt: string;
  score: number;
}

function findMatches(clusters: Cluster[], query: string, limit = 6): Match[] {
  const q = query.trim();
  if (!q) return [];
  const all: Match[] = [];
  for (const c of clusters) {
    const titleScore = fuzzyScore(q, c.dominantTitle);
    let bestEvent = c.dominantTitle;
    let bestScore = titleScore;
    for (const e of c.events) {
      const s = fuzzyScore(q, e.title);
      if (s > bestScore) {
        bestScore = s;
        bestEvent = e.title;
      }
    }
    const sourceScore = c.events.reduce(
      (m, e) => Math.max(m, fuzzyScore(q, e.source) * 0.5),
      0,
    );
    const finalScore = Math.max(bestScore, sourceScore);
    if (finalScore > 1) {
      all.push({ cluster: c, excerpt: bestEvent, score: finalScore });
    }
  }
  return all.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function SearchBar() {
  const clusters = useGlobeStore((s) => s.clusters);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const recentSearches = useBookmarksStore((s) => s.recentSearches);
  const pushSearch = useBookmarksStore((s) => s.pushSearch);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(
    () => findMatches(clusters, query),
    [clusters, query],
  );

  const goTo = (m: Match) => {
    pushSearch(query);
    selectCluster(m.cluster.id);
    flyTo(m.cluster.lat, m.cluster.lng);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="pointer-events-auto relative w-[360px]">
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-widest text-cyan-300/55"
        >
          ⌕
        </span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) goTo(matches[0]);
            if (e.key === "Escape") {
              setQuery("");
              setOpen(false);
            }
          }}
          placeholder="Search events, locations, sources..."
          className="w-full rounded-md border border-cyan-400/20 bg-[rgba(4,6,12,0.7)] py-1.5 pl-8 pr-3 font-mono text-xs text-cyan-50 placeholder:text-cyan-100/35 backdrop-blur-md focus:border-cyan-300/60 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-1.5 font-mono text-[10px] text-cyan-200/70 hover:bg-cyan-400/10"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 rounded-md border border-cyan-400/15 bg-[rgba(4,6,12,0.92)] p-1 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,240,255,0.4)]">
          {!query && recentSearches.length > 0 && (
            <>
              <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-cyan-300/55">
                Recent searches
              </div>
              {recentSearches.map((r) => (
                <button
                  key={r}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQuery(r);
                  }}
                  className="block w-full rounded px-2 py-1 text-left text-xs text-cyan-100/85 hover:bg-cyan-400/10"
                >
                  {r}
                </button>
              ))}
            </>
          )}
          {!query && recentSearches.length === 0 && (
            <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan-100/40">
              Type to search clusters, sources, regions
            </div>
          )}
          {query && matches.length === 0 && (
            <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-cyan-100/40">
              No matches
            </div>
          )}
          {query &&
            matches.map((m) => (
              <button
                key={m.cluster.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goTo(m)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-cyan-400/10"
              >
                <span
                  className="block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[m.cluster.category],
                    boxShadow: `0 0 6px ${CATEGORY_COLORS[m.cluster.category]}`,
                  }}
                />
                <span className="line-clamp-1 flex-1 text-xs text-cyan-50/95">
                  {m.excerpt}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-200/55">
                  {m.cluster.events.length}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
