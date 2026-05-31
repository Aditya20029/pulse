"use client";

import * as THREE from "three";
import { Category } from "./types";

const cache = new Map<string, THREE.CanvasTexture>();

function drawShape(
  ctx: CanvasRenderingContext2D,
  category: Category,
  color: string,
  size: number,
) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.34;

  ctx.shadowColor = color;
  ctx.shadowBlur = size * 0.18;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = size * 0.018;

  ctx.beginPath();
  switch (category) {
    case "conflict": {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r * 0.95, cy + r * 0.7);
      ctx.lineTo(cx - r * 0.95, cy + r * 0.7);
      ctx.closePath();
      break;
    }
    case "politics": {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      break;
    }
    case "economy": {
      ctx.rect(cx - r * 0.85, cy - r * 0.85, r * 1.7, r * 1.7);
      break;
    }
    case "environment": {
      ctx.ellipse(
        cx,
        cy,
        r * 0.95,
        r * 0.55,
        Math.PI / 4,
        0,
        Math.PI * 2,
      );
      break;
    }
    case "wildlife": {
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const ang = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.5;
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case "tech": {
      const points = 6;
      for (let i = 0; i < points; i++) {
        const ang = (i / points) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case "science": {
      // atom-like: small core + draw orbits separately
      ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.lineWidth = size * 0.04;
      ctx.strokeStyle = color;
      ctx.ellipse(cx, cy, r, r * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.4, Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.4, -Math.PI / 3, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    case "health": {
      // plus sign
      const arm = r * 0.7;
      const w = r * 0.35;
      ctx.rect(cx - w, cy - arm, w * 2, arm * 2);
      ctx.rect(cx - arm, cy - w, arm * 2, w * 2);
      break;
    }
    case "culture": {
      // double circle / flower-ish
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = size * 0.05;
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    default: {
      ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  ctx.stroke();
}

export function getCategoryIcon(
  category: Category,
  color: string,
): THREE.CanvasTexture {
  const key = `${category}-${color}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    drawShape(ctx, category, color, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
