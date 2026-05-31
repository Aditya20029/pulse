"use client";

import useSWR from "swr";

interface FeedResponse {
  headlines: unknown[];
}

interface SourceInfo {
  sources: string[];
  isLive: boolean;
}

async function fetcher(url: string): Promise<SourceInfo> {
  const res = await fetch(url);
  const header = res.headers.get("x-pulse-source") ?? "";
  await res.json().catch(() => ({} as FeedResponse));
  const sources = header
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return {
    sources,
    isLive: sources.length > 0 && !(sources.length === 1 && sources[0] === "mock"),
  };
}

const LABELS: Record<string, { label: string; color: string }> = {
  gdelt: { label: "GDELT", color: "#a3e635" },
  rss: { label: "RSS x45", color: "#a3e635" },
  reddit: { label: "Reddit", color: "#fb923c" },
  hn: { label: "HN", color: "#f97316" },
  mock: { label: "DEMO", color: "#fbbf24" },
};

export function DataSourceBadge() {
  const { data } = useSWR<SourceInfo>("/api/news/feed", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  const sources = data?.sources ?? [];
  if (sources.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-zinc-800/70 bg-[#0a0b0e] px-3 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
        Feed
      </span>
      {sources.map((s) => {
        const meta = LABELS[s] ?? { label: s.toUpperCase(), color: "#a1a1aa" };
        return (
          <span
            key={s}
            className="flex items-center gap-1.5"
            title={`Data source: ${meta.label}`}
          >
            <span
              className="block h-1.5 w-1.5 rounded-full"
              style={{
                background: meta.color,
                boxShadow: `0 0 4px ${meta.color}`,
              }}
            />
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: meta.color }}
            >
              {meta.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
