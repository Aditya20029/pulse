"use client";

import useSWR from "swr";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { CATEGORY_COLORS, FeedHeadline } from "@/lib/types";
import { safeUrl, isSafeUrl } from "@/lib/safe-url";

interface FeedResponse {
  headlines: FeedHeadline[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function BottomTicker() {
  const { data } = useSWR<FeedResponse>("/api/news/feed", fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });
  const clusters = useGlobeStore((s) => s.clusters);
  const flyTo = useGlobeStore((s) => s.flyTo);
  const selectCluster = useGlobeStore((s) => s.selectCluster);

  const headlines = data?.headlines ?? [];
  if (headlines.length === 0) return null;

  const looped = [...headlines, ...headlines];

  const onHeadlineClick = (h: FeedHeadline) => {
    const lower = h.title.toLowerCase();
    const match = clusters.find((c) =>
      c.events.some((e) => e.title.toLowerCase() === lower),
    );
    if (match) {
      selectCluster(match.id);
      flyTo(match.lat, match.lng);
    } else if (isSafeUrl(h.url)) {
      window.open(safeUrl(h.url), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-6 pb-4">
      <div className="pointer-events-auto rounded-lg border border-cyan-400/15 bg-[rgba(10,10,15,0.85)] backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">
            Feed
          </span>
          <span className="h-3 w-px bg-cyan-400/25" />
          <div className="ticker-mask flex-1 overflow-hidden">
            <div className="ticker-track flex gap-10 whitespace-nowrap">
              {looped.map((h, i) => (
                <button
                  type="button"
                  key={`${h.id}-${i}`}
                  onClick={() => onHeadlineClick(h)}
                  className="flex items-center gap-2 text-left transition hover:text-cyan-100"
                >
                  <span
                    className="block h-1.5 w-1.5 rounded-full"
                    style={{
                      background: CATEGORY_COLORS[h.category],
                      boxShadow: `0 0 6px ${CATEGORY_COLORS[h.category]}`,
                    }}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-200/65">
                    {h.source}
                  </span>
                  <span className="text-sm text-cyan-50/95">{h.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
