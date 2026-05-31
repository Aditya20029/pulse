"use client";

import { useEffect, useRef } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";

const PRIORITY_THRESHOLD = 0.55;

interface DroneRefs {
  ctx: AudioContext;
  master: GainNode;
  oscA: OscillatorNode;
  oscB: OscillatorNode;
  filter: BiquadFilterNode;
  noise: AudioBufferSourceNode;
  noiseGain: GainNode;
}

function createDrone(): DroneRefs {
  const ctx = new AudioContext();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.7;
  filter.connect(master);

  const oscA = ctx.createOscillator();
  oscA.type = "sine";
  oscA.frequency.value = 55;
  const gA = ctx.createGain();
  gA.gain.value = 0.35;
  oscA.connect(gA).connect(filter);
  oscA.start();

  const oscB = ctx.createOscillator();
  oscB.type = "triangle";
  oscB.frequency.value = 82.41;
  const gB = ctx.createGain();
  gB.gain.value = 0.18;
  oscB.connect(gB).connect(filter);
  oscB.start();

  const bufferSize = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.45;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.025;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 320;
  noiseFilter.Q.value = 0.6;
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start();

  return { ctx, master, oscA, oscB, filter, noise, noiseGain };
}

function chime(ctx: AudioContext, freq: number = 880) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g).connect(ctx.destination);
  const t = ctx.currentTime;
  g.gain.linearRampToValueAtTime(0.18, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
  o.start(t);
  o.stop(t + 1);

  const o2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  o2.type = "sine";
  o2.frequency.value = freq * 1.5;
  g2.gain.value = 0;
  o2.connect(g2).connect(ctx.destination);
  g2.gain.linearRampToValueAtTime(0.08, t + 0.03);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
  o2.start(t);
  o2.stop(t + 1);
}

export function AudioEngine() {
  const enabled = useGlobeStore((s) => s.soundEnabled);
  const clusters = useGlobeStore((s) => s.clusters);
  const droneRef = useRef<DroneRefs | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      const d = droneRef.current;
      if (d) {
        d.master.gain.linearRampToValueAtTime(
          0,
          d.ctx.currentTime + 0.4,
        );
        setTimeout(() => {
          try {
            d.ctx.close();
          } catch {}
        }, 600);
        droneRef.current = null;
      }
      return;
    }

    if (!droneRef.current) {
      try {
        droneRef.current = createDrone();
        const d = droneRef.current;
        d.master.gain.linearRampToValueAtTime(
          0.10,
          d.ctx.currentTime + 0.8,
        );
      } catch (err) {
        console.warn("audio init failed", err);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!initRef.current && clusters.length > 0) {
      for (const c of clusters) seenIdsRef.current.add(c.id);
      initRef.current = true;
      return;
    }
    const d = droneRef.current;
    if (!d || !enabled) {
      for (const c of clusters) seenIdsRef.current.add(c.id);
      return;
    }
    let count = 0;
    for (const c of clusters) {
      if (!seenIdsRef.current.has(c.id) && c.intensity >= PRIORITY_THRESHOLD) {
        count += 1;
        seenIdsRef.current.add(c.id);
      } else {
        seenIdsRef.current.add(c.id);
      }
    }
    if (count > 0) {
      const baseFreq = 740 + Math.random() * 200;
      chime(d.ctx, baseFreq);
    }
  }, [clusters, enabled]);

  return null;
}

export function SoundToggle() {
  const enabled = useGlobeStore((s) => s.soundEnabled);
  const setEnabled = useGlobeStore((s) => s.setSoundEnabled);
  return (
    <button
      type="button"
      onClick={() => setEnabled(!enabled)}
      data-screenshot-hide="true"
      title={enabled ? "Mute" : "Enable ambient audio"}
      aria-label={enabled ? "Mute" : "Enable ambient audio"}
      className={`flex h-7 items-center gap-1 rounded border px-2 font-mono text-[10px] uppercase tracking-widest transition ${
        enabled
          ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100"
          : "border-cyan-400/20 bg-cyan-400/5 text-cyan-200/65 hover:bg-cyan-400/10"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3.5 w-3.5"
      >
        {enabled ? (
          <>
            <path d="M11 5L6 9H2v6h4l5 4z" />
            <path d="M15.54 8.46a5 5 0 010 7.07" />
            <path d="M19.07 4.93a10 10 0 010 14.14" />
          </>
        ) : (
          <>
            <path d="M11 5L6 9H2v6h4l5 4z" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
          </>
        )}
      </svg>
    </button>
  );
}
