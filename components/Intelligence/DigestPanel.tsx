"use client";

import { useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { CATEGORY_COLORS, Category } from "@/lib/types";

interface DigestSection {
  heading: string;
  body: string;
  category: string;
}

interface DigestResponse {
  title: string;
  summary: string;
  sections: DigestSection[];
  generated_at: string;
}

export function DigestPanel() {
  const [data, setData] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const clusters = useGlobeStore((s) => s.clusters);

  const generate = async () => {
    if (clusters.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/news/digest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ clusters }),
      });
      const d = (await res.json()) as DigestResponse;
      setData(d);
      setOpen(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (open && data) {
    return (
      <div
        data-screenshot-hide="true"
        className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
        onClick={() => setOpen(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[640px] max-h-[85vh] overflow-hidden rounded-lg border border-cyan-400/25 bg-[rgba(4,6,12,0.97)] shadow-[0_0_80px_-15px_rgba(0,240,255,0.5)]"
        >
          <div className="flex items-start justify-between border-b border-cyan-400/15 px-6 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/65">
                What mattered today
              </div>
              <h2 className="mt-1 text-xl font-semibold leading-tight text-cyan-50">
                {data.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-cyan-400/20 px-2 py-0.5 font-mono text-sm text-cyan-200 hover:bg-cyan-400/10"
            >
              ×
            </button>
          </div>
          <div className="max-h-[calc(85vh-90px)] overflow-y-auto px-6 py-5">
            {data.summary && (
              <p className="mb-5 border-l-2 border-cyan-400/40 pl-4 text-[13px] leading-relaxed text-cyan-50/85">
                {data.summary}
              </p>
            )}
            {data.sections.map((s, i) => {
              const cat = (s.category as Category) ?? "other";
              const color = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other;
              return (
                <section key={i} className="mb-5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className="block h-2 w-2 rounded-full"
                      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                    />
                    <h3 className="text-[13px] font-semibold text-cyan-50">
                      {s.heading}
                    </h3>
                  </div>
                  <p className="text-[12px] leading-relaxed text-cyan-50/75">
                    {s.body}
                  </p>
                </section>
              );
            })}
            {data.generated_at && (
              <div className="mt-5 border-t border-cyan-400/10 pt-3 font-mono text-[9px] uppercase tracking-widest text-cyan-100/40">
                Generated {new Date(data.generated_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={generate}
        disabled={loading || clusters.length === 0}
        className="w-full rounded border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-50"
      >
        {loading ? "Generating digest..." : "Generate daily digest"}
      </button>
      <a
        href="/report"
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full rounded border border-cyan-400/15 bg-white/[0.02] px-3 py-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-cyan-100/75 hover:bg-cyan-400/10"
      >
        Open printable PDF report ↗
      </a>
    </div>
  );
}
