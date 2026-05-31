"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Feature } from "geojson";
import { useFrame } from "@react-three/fiber";
import { loadWorldAtlas } from "@/lib/world-atlas";
import { findCountry, countryName } from "@/lib/country-detection";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/globe-utils";
import { useGlobeStore } from "@/stores/useGlobeStore";

function featureToLineSegments(feature: Feature, radius: number): Float32Array {
  const segs: number[] = [];
  const drawRing = (ring: number[][]) => {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = latLngToVector3(ring[i][1], ring[i][0], radius);
      const b = latLngToVector3(ring[i + 1][1], ring[i + 1][0], radius);
      segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  };
  const geom = feature.geometry;
  if (!geom) return new Float32Array();
  if (geom.type === "Polygon") {
    for (const ring of geom.coordinates as number[][][]) drawRing(ring);
  } else if (geom.type === "MultiPolygon") {
    for (const poly of geom.coordinates as number[][][][]) {
      for (const ring of poly) drawRing(ring);
    }
  }
  return new Float32Array(segs);
}

export function CountryHighlight() {
  const [features, setFeatures] = useState<Feature[] | null>(null);
  const hoveredCoords = useGlobeStore((s) => s.hoveredCoords);
  const setHoveredCountry = useGlobeStore((s) => s.setHoveredCountry);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  useEffect(() => {
    loadWorldAtlas().then((d) => setFeatures(d.features)).catch(() => {});
  }, []);

  const country = useMemo(() => {
    if (!features || !hoveredCoords) return null;
    return findCountry(features, hoveredCoords.lat, hoveredCoords.lng);
  }, [features, hoveredCoords]);

  useEffect(() => {
    setHoveredCountry(countryName(country));
  }, [country, setHoveredCountry]);

  const positions = useMemo(() => {
    if (!country) return null;
    // Just barely above the surface so the line stays perfectly aligned with
    // the country on the texture at any zoom level. Larger offsets cause
    // parallax misalignment when the camera is near the surface.
    return featureToLineSegments(country, GLOBE_RADIUS * 1.0008);
  }, [country]);

  useFrame((state) => {
    if (matRef.current) {
      const pulse = 0.55 + 0.45 * Math.sin(state.clock.elapsedTime * 2.5);
      matRef.current.opacity = 0.5 + pulse * 0.35;
    }
  });

  if (!positions || positions.length === 0) return null;

  return (
    <lineSegments key={countryName(country) ?? "none"}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        ref={matRef}
        color="#00f0ff"
        transparent
        opacity={0.85}
        depthWrite={false}
        depthTest={true}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-1}
      />
    </lineSegments>
  );
}
