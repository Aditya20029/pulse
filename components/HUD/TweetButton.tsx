"use client";

import { useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

function buildTweet(): string {
  const state = useGlobeStore.getState();
  const top = [...state.clusters]
    .sort((a, b) => b.events.length - a.events.length)
    .slice(0, 3);
  if (top.length === 0) return "Watching the globe on Pulse.";
  const dateLine = new Date().toUTCString().slice(0, 16);
  const lines: string[] = [];
  lines.push(`📡 Pulse digest, ${dateLine}`);
  lines.push("");
  for (const c of top) {
    lines.push(`• ${c.dominantTitle}`);
  }
  lines.push("");
  lines.push(`${state.clusters.length} clusters tracked. AI analysis at pulse.`);
  return lines.join("\n");
}

export function TweetButton() {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    const tweet = buildTweet();
    try {
      await navigator.clipboard.writeText(tweet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const t = document.createElement("textarea");
      t.value = tweet;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      data-screenshot-hide="true"
      title="Copy tweet template"
      aria-label="Copy tweet template"
      className="flex h-7 items-center gap-1.5 rounded border border-cyan-400/25 bg-cyan-400/5 px-2.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-400/15"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 4L11.5 14.5 8 11l-6 11L20 6z" />
      </svg>
      {copied ? "Copied" : "Tweet"}
    </button>
  );
}
