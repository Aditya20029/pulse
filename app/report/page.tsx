"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  Category,
  Cluster,
  GlobeFeedResponse,
} from "@/lib/types";

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

export default function ReportPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [digest, setDigest] = useState<DigestResponse | null>(null);

  useEffect(() => {
    fetch("/api/news/globe?timespan=24h")
      .then((r) => r.json())
      .then((d: GlobeFeedResponse) => setClusters(d.clusters ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (clusters.length === 0) return;
    fetch("/api/news/digest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ clusters }),
    })
      .then((r) => r.json())
      .then((d: DigestResponse) => setDigest(d))
      .catch(() => {});
  }, [clusters]);

  const stats = useMemo(() => {
    const byCat = new Map<Category, number>();
    let total = 0;
    for (const c of clusters) {
      byCat.set(c.category, (byCat.get(c.category) ?? 0) + c.events.length);
      total += c.events.length;
    }
    const sorted = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]);
    return { byCat: sorted, total };
  }, [clusters]);

  const topClusters = useMemo(
    () =>
      [...clusters]
        .sort((a, b) => b.events.length - a.events.length)
        .slice(0, 10),
    [clusters],
  );

  return (
    <main className="report-root mx-auto min-h-screen max-w-[820px] bg-white px-12 py-12 text-zinc-900 print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between border-b border-zinc-300 pb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
            Pulse Intelligence
          </div>
          <h1 className="mt-1 text-3xl font-semibold text-zinc-900">
            {digest?.title ?? "Daily Briefing"}
          </h1>
        </div>
        <div className="text-right text-xs text-zinc-500">
          {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.print()}
        className="mb-8 rounded-md border border-zinc-300 bg-zinc-100 px-4 py-1.5 text-xs uppercase tracking-widest text-zinc-700 hover:bg-zinc-200 print:hidden"
      >
        Print or save as PDF
      </button>

      {digest?.summary && (
        <p className="mb-6 border-l-2 border-zinc-300 pl-4 text-base leading-relaxed text-zinc-700">
          {digest.summary}
        </p>
      )}

      {digest && digest.sections.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900">
            What mattered today
          </h2>
          {digest.sections.map((s, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{
                    background:
                      CATEGORY_COLORS[(s.category as Category) ?? "other"],
                  }}
                />
                <h3 className="text-sm font-semibold text-zinc-900">
                  {s.heading}
                </h3>
              </div>
              <p className="ml-4 mt-1 text-sm leading-relaxed text-zinc-700">
                {s.body}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          Category breakdown
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {stats.byCat.map(([cat, count]) => (
            <div
              key={cat}
              className="flex items-center justify-between rounded border border-zinc-200 px-3 py-1.5 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="block h-2 w-2 rounded-full"
                  style={{ background: CATEGORY_COLORS[cat] }}
                />
                <span>{CATEGORY_LABELS[cat]}</span>
              </div>
              <span className="font-mono tabular-nums text-zinc-600">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900">
          Top 10 clusters
        </h2>
        <ol className="space-y-2.5 pl-5">
          {topClusters.map((c) => (
            <li key={c.id} className="text-sm leading-relaxed text-zinc-700">
              <span className="font-medium text-zinc-900">
                {c.dominantTitle}
              </span>
              <span className="ml-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
                {c.category} · {c.events.length} events · ({c.lat.toFixed(1)}, {c.lng.toFixed(1)})
              </span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-12 border-t border-zinc-300 pt-3 text-xs text-zinc-400">
        Generated by Pulse, global news intelligence globe.
        {digest?.generated_at && (
          <> Digest written {new Date(digest.generated_at).toLocaleString()}.</>
        )}
        <> {stats.total} events tracked across {clusters.length} clusters.</>
      </footer>
    </main>
  );
}
