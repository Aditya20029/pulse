"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/globe-utils";

const COUNTRIES_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

type CoordinateRing = [number, number][];
type LonLatPolygon = CoordinateRing[];

interface FeatureLike {
  geometry?: {
    type: string;
    coordinates: unknown;
  };
}

function flattenLineSegments(features: FeatureLike[]): Float32Array {
  const segments: number[] = [];
  const radius = GLOBE_RADIUS * 1.001;

  const pushPolygon = (polygon: LonLatPolygon) => {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lng1, lat1] = ring[i];
        const [lng2, lat2] = ring[i + 1];
        const a = latLngToVector3(lat1, lng1, radius);
        const b = latLngToVector3(lat2, lng2, radius);
        segments.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  };

  for (const f of features) {
    const geom = f.geometry;
    if (!geom) continue;
    if (geom.type === "Polygon") {
      pushPolygon(geom.coordinates as LonLatPolygon);
    } else if (geom.type === "MultiPolygon") {
      for (const polygon of geom.coordinates as LonLatPolygon[]) {
        pushPolygon(polygon);
      }
    }
  }
  return new Float32Array(segments);
}

export function CountryBorders() {
  const [positions, setPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((topo) => {
        if (cancelled) return;
        const collection = feature(
          topo,
          topo.objects.countries,
        ) as unknown as { features: FeatureLike[] };
        const arr = flattenLineSegments(collection.features);
        setPositions(arr);
      })
      .catch((err) => {
        console.warn("country borders load failed", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#22d3ee"),
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    [],
  );

  if (!positions) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <primitive attach="material" object={material} />
    </lineSegments>
  );
}
