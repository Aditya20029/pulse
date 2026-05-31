"use client";

import useSWR from "swr";
import { CATEGORY_COLORS, FeedHeadline } from "@/lib/types";

interface FeedResponse {
  headlines: FeedHeadline[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NewsTicker() {
  const { data } = useSWR<FeedResponse>("/api/news/feed", fetcher, {
    refreshInterval: 60 * 1000,
    revalidateOnFocus: false,
  });

  const headlines = (data?.headlines ?? []).slice(0, 50);
  if (headlines.length === 0) return null;

  const looped = [...headlines, ...headlines];

  return (
    <div className="pointer-events-auto rounded-md border border-zinc-800/70 bg-[#0a0b0e]">
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-red-300">
            Tape
          </span>
        </div>
        <span className="h-3 w-px shrink-0 bg-zinc-800" />
        <div className="ticker-mask flex-1 overflow-hidden">
          <div className="ticker-track flex gap-6 whitespace-nowrap">
            {looped.map((h, i) => (
              <a
                key={`${h.id}-${i}`}
                href={h.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition hover:text-zinc-100"
              >
                <span
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{
                    background: CATEGORY_COLORS[h.category],
                    boxShadow: `0 0 4px ${CATEGORY_COLORS[h.category]}`,
                  }}
                />
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {h.source}
                </span>
                <span className="text-xs text-zinc-200/90">{h.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
