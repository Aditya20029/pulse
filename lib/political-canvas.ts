"use client";

import * as THREE from "three";
import type { Feature } from "geojson";

const W = 4096;
const H = 2048;

const PALETTE = [
  "#0e2233",
  "#13314a",
  "#163a55",
  "#1b4664",
  "#0f2a3f",
  "#1d3d5a",
  "#0a1c2b",
  "#1b3247",
];

function project(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return [x, y];
}

function colorFor(feature: Feature, i: number): string {
  const id = String(feature.id ?? i);
  let hash = 0;
  for (let c = 0; c < id.length; c++) hash = (hash * 31 + id.charCodeAt(c)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function buildPoliticalCanvas(features: Feature[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#020610";
  ctx.fillRect(0, 0, W, H);

  const drawRing = (ring: number[][]) => {
    ctx.beginPath();
    for (let i = 0; i < ring.length; i++) {
      const [lng, lat] = ring[i];
      const [x, y] = project(lng, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };

  features.forEach((f, idx) => {
    const geom = f.geometry;
    if (!geom) return;
    ctx.fillStyle = colorFor(f, idx);
    ctx.strokeStyle = "rgba(125, 211, 252, 0.45)";
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    if (geom.type === "Polygon") {
      for (const ring of geom.coordinates as number[][][]) {
        drawRing(ring);
        ctx.fill();
        ctx.stroke();
      }
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates as number[][][][]) {
        for (const ring of poly) {
          drawRing(ring);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  });

  ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
  ctx.lineWidth = 0.6;
  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = project(0, lat);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 15) {
    const [x] = project(lng, 0);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  return canvas;
}

export function buildPoliticalTexture(features: Feature[]): THREE.CanvasTexture {
  const canvas = buildPoliticalCanvas(features);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
