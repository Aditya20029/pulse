"use client";

import { useEffect, useRef, useState } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

const MAX_HOURS = 24;
const RECORD_DURATION_MS = 10_000;

async function recordTimelapse(
  setTimeScrub: (h: number | null) => void,
): Promise<void> {
  const canvas = document.querySelector<HTMLCanvasElement>("main canvas");
  if (!canvas) {
    console.warn("No canvas found for recording");
    return;
  }
  const stream = canvas.captureStream(30);
  const mimes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  let chosen = "";
  for (const m of mimes) {
    if (MediaRecorder.isTypeSupported(m)) {
      chosen = m;
      break;
    }
  }
  if (!chosen) {
    console.warn("MediaRecorder not supported");
    return;
  }
  const recorder = new MediaRecorder(stream, {
    mimeType: chosen,
    videoBitsPerSecond: 6_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: chosen }));
  });
  recorder.start();
  setTimeScrub(MAX_HOURS);
  const start = performance.now();
  await new Promise<void>((resolve) => {
    const step = (t: number) => {
      const elapsed = t - start;
      const progress = Math.min(elapsed / RECORD_DURATION_MS, 1);
      const hours = MAX_HOURS * (1 - progress);
      setTimeScrub(hours > 0.1 ? hours : null);
      if (progress >= 1) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  recorder.stop();
  const blob = await done;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pulse-timelapse-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatTimeOffset(hoursAgo: number): string {
  if (hoursAgo < 0.5) return "Live";
  if (hoursAgo < 1) return `${Math.round(hoursAgo * 60)} min ago`;
  if (hoursAgo < 24) return `${hoursAgo.toFixed(1)}h ago`;
  return `${(hoursAgo / 24).toFixed(1)}d ago`;
}

export function TimeScrubSlider() {
  const hoursAgo = useGlobeStore((s) => s.timeScrubHoursAgo);
  const setTimeScrub = useGlobeStore((s) => s.setTimeScrub);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const onRecord = async () => {
    if (recording) return;
    setRecording(true);
    setPlaying(false);
    try {
      await recordTimelapse(setTimeScrub);
    } catch (err) {
      console.error("timelapse record failed", err);
    } finally {
      setRecording(false);
      setTimeScrub(null);
    }
  };

  const value = hoursAgo ?? 0;
  const isLive = hoursAgo === null;

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (t: number) => {
      if (!lastTickRef.current) lastTickRef.current = t;
      const dt = (t - lastTickRef.current) / 1000;
      lastTickRef.current = t;
      const current = useGlobeStore.getState().timeScrubHoursAgo ?? 0;
      const next = current - dt * 1.5;
      if (next <= 0) {
        useGlobeStore.getState().setTimeScrub(null);
        setPlaying(false);
      } else {
        useGlobeStore.getState().setTimeScrub(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    lastTickRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const onChange = (v: number) => {
    setPlaying(false);
    if (v < 0.05) setTimeScrub(null);
    else setTimeScrub(v);
  };

  const onPlayToggle = () => {
    if (isLive) {
      setTimeScrub(MAX_HOURS);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  return (
    <div className="pointer-events-auto rounded-lg border border-cyan-400/15 bg-[rgba(4,6,12,0.85)] px-4 py-2 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-300/65">
          Timeline
        </span>
        <button
          type="button"
          onClick={onPlayToggle}
          className="flex h-5 w-5 items-center justify-center rounded border border-cyan-400/30 bg-cyan-400/10 font-mono text-[10px] text-cyan-200 hover:border-cyan-300 hover:bg-cyan-400/20"
          aria-label={playing ? "Pause timeline" : "Play timeline"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button
          type="button"
          onClick={onRecord}
          disabled={recording}
          data-screenshot-hide="true"
          className="flex h-5 items-center gap-1 rounded border border-red-400/30 bg-red-500/10 px-2 font-mono text-[9px] uppercase tracking-widest text-red-200 hover:border-red-300/60 hover:bg-red-500/20 disabled:opacity-50"
          aria-label="Record timelapse"
          title="Record 10s timelapse"
        >
          <span
            className="block h-1.5 w-1.5 rounded-full bg-red-400"
            style={{
              boxShadow: recording
                ? "0 0 6px #f87171"
                : "0 0 4px rgba(248,113,113,0.5)",
              animation: recording ? "pulse 1s infinite" : "none",
            }}
          />
          {recording ? "REC" : "REC"}
        </button>
        <div className="relative flex-1">
          <input
            type="range"
            min={0}
            max={MAX_HOURS}
            step={0.05}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="time-scrub w-full"
          />
          <div className="pointer-events-none absolute inset-x-0 -bottom-3 flex justify-between font-mono text-[8px] uppercase tracking-widest text-cyan-100/45">
            <span>Now</span>
            <span>-6H</span>
            <span>-12H</span>
            <span>-18H</span>
            <span>-24H</span>
          </div>
        </div>
        <div className="ml-1 flex min-w-[100px] items-center justify-end gap-2">
          <span
            className={`font-mono text-xs tabular-nums ${
              isLive ? "text-emerald-300" : "text-amber-200"
            }`}
          >
            {isLive ? "LIVE" : `T-${value.toFixed(1)}H`}
          </span>
          {!isLive && (
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setTimeScrub(null);
              }}
              className="rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-cyan-200 hover:bg-cyan-400/20"
            >
              Live
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 font-mono text-[9px] uppercase tracking-wider text-cyan-100/40">
        {formatTimeOffset(value)} signals
      </div>
    </div>
  );
}
