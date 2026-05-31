"use client";

import * as THREE from "three";
import type { Feature } from "geojson";

type Ring = [number, number][];
type Polygon = Ring[];

const TEX_WIDTH = 4096;
const TEX_HEIGHT = 2048;

const OCEAN_COLOR = "#02040a";
const LAND_BASE = "#0b1c2c";
const LAND_GLOW = "rgba(34, 211, 238, 0.10)";
const BORDER_COLOR = "rgba(56, 189, 248, 0.35)";

function project(lng: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lng + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return [x, y];
}

function tracePolygon(
  ctx: CanvasRenderingContext2D,
  polygon: Polygon,
  width: number,
  height: number,
) {
  ctx.beginPath();
  for (const ring of polygon) {
    for (let i = 0; i < ring.length; i++) {
      const [lng, lat] = ring[i];
      const [x, y] = project(lng, lat, width, height);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}

export function buildEarthCanvas(features: Feature[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_WIDTH;
  canvas.height = TEX_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = OCEAN_COLOR;
  ctx.fillRect(0, 0, TEX_WIDTH, TEX_HEIGHT);

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, TEX_HEIGHT);
  oceanGrad.addColorStop(0, "rgba(8, 18, 32, 0.5)");
  oceanGrad.addColorStop(0.5, "rgba(0, 0, 0, 0)");
  oceanGrad.addColorStop(1, "rgba(8, 18, 32, 0.5)");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, TEX_WIDTH, TEX_HEIGHT);

  const drawFeature = (f: Feature, fill: string, stroke: string, strokeWidth: number) => {
    const geom = f.geometry;
    if (!geom) return;
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (geom.type === "Polygon") {
      tracePolygon(ctx, geom.coordinates as Polygon, TEX_WIDTH, TEX_HEIGHT);
      ctx.fill();
      ctx.stroke();
    } else if (geom.type === "MultiPolygon") {
      for (const poly of geom.coordinates as Polygon[]) {
        tracePolygon(ctx, poly, TEX_WIDTH, TEX_HEIGHT);
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  for (const f of features) {
    drawFeature(f, LAND_BASE, BORDER_COLOR, 1.4);
  }

  ctx.globalCompositeOperation = "lighter";
  for (const f of features) {
    drawFeature(f, LAND_GLOW, "rgba(0,0,0,0)", 0);
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.strokeStyle = "rgba(56, 189, 248, 0.06)";
  ctx.lineWidth = 0.6;
  for (let lat = -75; lat <= 75; lat += 15) {
    const [, y] = project(0, lat, TEX_WIDTH, TEX_HEIGHT);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TEX_WIDTH, y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 15) {
    const [x] = project(lng, 0, TEX_WIDTH, TEX_HEIGHT);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TEX_HEIGHT);
    ctx.stroke();
  }

  return canvas;
}

export function buildEarthTexture(features: Feature[]): THREE.CanvasTexture {
  const canvas = buildEarthCanvas(features);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
