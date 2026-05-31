"use client";

import useSWR from "swr";
import { CATEGORY_COLORS, FeedHeadline } from "@/lib/types";

interface FeedResponse {
  headlines: FeedHeadline[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return "now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function LiveActivity() {
  const { data, isLoading } = useSWR<FeedResponse>("/api/news/feed", fetcher, {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 30 * 1000,
  });

  const items = (data?.headlines ?? []).slice(0, 30);

  if (items.length === 0) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 animate-pulse rounded border border-zinc-800/60 bg-zinc-900/30"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
        {isLoading && (
          <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-500">
            Aggregating Reddit + RSS feeds (about 1 second)…
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-h-[260px] space-y-1 overflow-y-auto pr-1">
      {items.map((h) => (
        <a
          key={h.id}
          href={h.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 rounded border border-zinc-800/50 bg-white/[0.015] px-2 py-1.5 transition hover:border-zinc-700 hover:bg-white/[0.04]"
        >
          <span
            className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              background: CATEGORY_COLORS[h.category],
              boxShadow: `0 0 4px ${CATEGORY_COLORS[h.category]}`,
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="line-clamp-2 text-[11px] leading-snug text-zinc-100">
              {h.title}
            </div>
            <div className="mt-0.5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-wider text-zinc-500">
              <span>{h.source}</span>
              <span>·</span>
              <span>{timeAgo(h.datetime)} ago</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
