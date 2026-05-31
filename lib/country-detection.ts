"use client";

import type { Feature } from "geojson";

function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function findCountry(
  features: Feature[],
  lat: number,
  lng: number,
): Feature | null {
  for (const f of features) {
    const geom = f.geometry;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      const rings = geom.coordinates as number[][][];
      if (rings.length > 0 && pointInRing(lng, lat, rings[0])) {
        let inHole = false;
        for (let k = 1; k < rings.length; k++) {
          if (pointInRing(lng, lat, rings[k])) {
            inHole = true;
            break;
          }
        }
        if (!inHole) return f;
      }
    } else if (geom.type === "MultiPolygon") {
      const polys = geom.coordinates as number[][][][];
      for (const poly of polys) {
        if (poly.length > 0 && pointInRing(lng, lat, poly[0])) {
          let inHole = false;
          for (let k = 1; k < poly.length; k++) {
            if (pointInRing(lng, lat, poly[k])) {
              inHole = true;
              break;
            }
          }
          if (!inHole) return f;
        }
      }
    }
  }
  return null;
}

export function countryName(feature: Feature | null): string | null {
  if (!feature) return null;
  const props = feature.properties as { name?: string } | null;
  return props?.name ?? null;
}
