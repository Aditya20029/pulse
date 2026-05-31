"use client";

import { useMemo } from "react";
import { Cluster } from "@/lib/types";

interface Props {
  clusters: Cluster[];
}

const STOPWORDS = new Set([
  "the","a","an","and","or","of","to","in","on","at","for","with","from","by","as",
  "is","are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","should","could","may","might","must","can","this","that","these",
  "those","its","it","also","new","amid","over","under","across","into","says","said",
  "after","before","when","while","than","then","such","some","more","most","one","two",
  "three","four","five","than","just","not","but","they","them","his","her","their","our",
  "you","your","who","what","why","how","where","which","there","here","about","off","up",
  "out","down","why","very","now","year","years","day","days","week","weeks","hour","hours",
  "live","news","latest","report","reports","update","updates","video","watch","photo",
  "photos","top","best","worst","first","last","next","amid","via",
]);

function extractTrends(clusters: Cluster[]): Array<{ term: string; count: number }> {
  const counts = new Map<string, number>();
  for (const c of clusters) {
    for (const e of c.events) {
      const words = e.title.split(/[^A-Za-z0-9'-]+/);
      // Look for capitalized words (proper nouns) and 2-word capitalized phrases
      for (let i = 0; i < words.length; i++) {
        const w = words[i];
        if (!w || w.length < 3) continue;
        const lower = w.toLowerCase();
        if (STOPWORDS.has(lower)) continue;
        if (!/^[A-Z]/.test(w)) continue;
        // Single token
        counts.set(w, (counts.get(w) ?? 0) + 1);
        // Two-token phrase if next is also capitalized
        if (i + 1 < words.length) {
          const next = words[i + 1];
          if (next && next.length >= 2 && /^[A-Z]/.test(next) && !STOPWORDS.has(next.toLowerCase())) {
            const phrase = `${w} ${next}`;
            counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
          }
        }
      }
    }
  }
  // Prefer multi-word phrases over their individual tokens
  const ranked = Array.from(counts.entries())
    .filter(([_, n]) => n >= 2)
    .sort((a, b) => {
      const aIsPhrase = a[0].includes(" ");
      const bIsPhrase = b[0].includes(" ");
      if (aIsPhrase !== bIsPhrase) return aIsPhrase ? -1 : 1;
      return b[1] - a[1];
    })
    .slice(0, 16)
    .map(([term, count]) => ({ term, count }));
  return ranked;
}

export function TrendingTopics({ clusters }: Props) {
  const trends = useMemo(() => extractTrends(clusters), [clusters]);

  if (trends.length === 0) {
    return (
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        No recurring entities yet
      </p>
    );
  }

  const max = trends[0]?.count ?? 1;
  return (
    <div className="flex flex-wrap gap-1.5">
      {trends.map((t) => {
        const heat = t.count / max;
        const fontSize = 10 + heat * 3;
        return (
          <span
            key={t.term}
            className="rounded border px-1.5 py-0.5 font-mono uppercase tracking-wider"
            style={{
              fontSize: `${fontSize}px`,
              color: heat > 0.6 ? "#a3e635" : heat > 0.3 ? "#cbd5e1" : "#94a3b8",
              borderColor:
                heat > 0.6
                  ? "rgba(163, 230, 53, 0.45)"
                  : "rgba(82, 82, 91, 0.6)",
              background:
                heat > 0.6
                  ? "rgba(163, 230, 53, 0.08)"
                  : "rgba(24, 24, 27, 0.4)",
            }}
            title={`${t.count} mentions`}
          >
            {t.term}{" "}
            <span style={{ opacity: 0.55 }}>{t.count}</span>
          </span>
        );
      })}
    </div>
  );
}
