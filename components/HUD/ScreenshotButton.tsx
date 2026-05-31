"use client";

import { useState } from "react";

async function exportScreenshot(pixelRatio: number = 2) {
  const { toPng } = await import("html-to-image");
  const node = document.querySelector("main");
  if (!node) return;

  const canvases = node.querySelectorAll("canvas");
  const replacements: Array<{ canvas: HTMLCanvasElement; img: HTMLImageElement }> = [];
  for (const canvas of Array.from(canvases)) {
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const img = document.createElement("img");
      img.src = dataUrl;
      img.width = canvas.clientWidth;
      img.height = canvas.clientHeight;
      img.style.cssText = canvas.getAttribute("style") ?? "";
      img.style.width = `${canvas.clientWidth}px`;
      img.style.height = `${canvas.clientHeight}px`;
      img.style.position = "absolute";
      img.style.inset = "0";
      canvas.parentElement?.appendChild(img);
      canvas.style.visibility = "hidden";
      replacements.push({ canvas, img });
    } catch {
      // ignore
    }
  }

  try {
    const dataUrl = await toPng(node as HTMLElement, {
      pixelRatio,
      cacheBust: true,
      backgroundColor: "#000000",
      filter: (el) => {
        if (!(el instanceof HTMLElement)) return true;
        return el.dataset.screenshotHide !== "true";
      },
    });
    const link = document.createElement("a");
    const suffix = pixelRatio >= 3 ? "-4k" : "";
    link.download = `pulse${suffix}-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    for (const { canvas, img } of replacements) {
      canvas.style.visibility = "";
      img.remove();
    }
  }
}

export function ScreenshotButton() {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const run = async (pr: number) => {
    if (busy) return;
    setBusy(true);
    setOpen(false);
    try {
      await exportScreenshot(pr);
    } catch (err) {
      console.error("screenshot failed", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative" data-screenshot-hide="true">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={busy}
        title="Export screenshot"
        aria-label="Export screenshot"
        className="flex h-7 items-center gap-1.5 rounded border border-cyan-400/25 bg-cyan-400/5 px-2.5 font-mono text-[10px] uppercase tracking-widest text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-400/15 disabled:opacity-50"
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
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <circle cx="12" cy="13" r="4" />
          <path d="M8 6l2-3h4l2 3" />
        </svg>
        {busy ? "Saving..." : "Export"}
      </button>
      {open && !busy && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-md border border-cyan-400/20 bg-[rgba(4,6,12,0.95)] p-1 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => run(2)}
            className="block w-full rounded px-2 py-1.5 text-left text-[11px] text-cyan-100 hover:bg-cyan-400/15"
          >
            HD screenshot
            <div className="font-mono text-[9px] text-cyan-100/45">2x DPR</div>
          </button>
          <button
            type="button"
            onClick={() => run(3.5)}
            className="block w-full rounded px-2 py-1.5 text-left text-[11px] text-cyan-100 hover:bg-cyan-400/15"
          >
            4K poster
            <div className="font-mono text-[9px] text-cyan-100/45">3.5x DPR</div>
          </button>
        </div>
      )}
    </div>
  );
}
