"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import useSWR from "swr";

import { Earth } from "./Earth";
import { Atmosphere } from "./Atmosphere";
import { Stars } from "./Stars";
import { NewsCluster } from "./NewsCluster";
import { ConnectionArc } from "./ConnectionArc";
import { CountryHighlight } from "./CountryHighlight";
import { CityDots } from "./CityDots";
import { Auroras } from "./Auroras";
import { Satellites } from "./Satellites";
import { Lightning } from "./Lightning";
import { Moon } from "./Moon";
import { Earthquakes } from "./Earthquakes";

import { useGlobeStore } from "@/stores/useGlobeStore";
import { Cluster, GlobeFeedResponse } from "@/lib/types";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/globe-utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function chooseRelatedClusters(
  selected: Cluster,
  all: Cluster[],
  limit: number = 5,
): Cluster[] {
  const byCategory = all.filter(
    (c) => c.id !== selected.id && c.category === selected.category,
  );
  return byCategory
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, limit);
}

function CameraFlyer() {
  const { camera, controls } = useThree() as unknown as {
    camera: THREE.PerspectiveCamera;
    controls: OrbitControlsImpl | null;
  };
  const target = useRef<THREE.Vector3 | null>(null);
  const startPos = useRef<THREE.Vector3 | null>(null);
  const t = useRef(1);
  const flyToTarget = useGlobeStore((s) => s.flyToTarget);

  useEffect(() => {
    if (!flyToTarget) return;
    const dest = latLngToVector3(
      flyToTarget.lat,
      flyToTarget.lng,
      GLOBE_RADIUS * 2.6,
    );
    target.current = dest;
    startPos.current = camera.position.clone();
    t.current = 0;
  }, [flyToTarget, camera]);

  useFrame((_, delta) => {
    if (!target.current || !startPos.current) return;
    if (t.current >= 1) return;
    t.current = Math.min(t.current + delta * 0.85, 1);
    const eased = 1 - Math.pow(1 - t.current, 3);
    const pos = startPos.current.clone().lerp(target.current, eased);
    camera.position.copy(pos);
    if (controls) {
      controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.08);
      controls.update();
    }
  });

  return null;
}

function GlobeContent() {
  const setClusters = useGlobeStore((s) => s.setClusters);
  const clusters = useGlobeStore((s) => s.clusters);
  const selectedId = useGlobeStore((s) => s.selectedClusterId);
  const hoveredId = useGlobeStore((s) => s.hoveredClusterId);
  const activeCategories = useGlobeStore((s) => s.activeCategories);
  const timespan = useGlobeStore((s) => s.timespan);
  const selectCluster = useGlobeStore((s) => s.selectCluster);
  const setHover = useGlobeStore((s) => s.setHover);
  const flyTo = useGlobeStore((s) => s.flyTo);

  const { data } = useSWR<GlobeFeedResponse>(
    `/api/news/globe?timespan=${timespan}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000, revalidateOnFocus: false },
  );

  useEffect(() => {
    if (data?.clusters) setClusters(data.clusters);
  }, [data, setClusters]);

  const timeScrubHoursAgo = useGlobeStore((s) => s.timeScrubHoursAgo);

  const visibleClusters = useMemo(() => {
    const byCategory = clusters.filter((c) => activeCategories.has(c.category));
    if (timeScrubHoursAgo === null) return byCategory;
    const targetMs = Date.now() - timeScrubHoursAgo * 3600 * 1000;
    const windowMs = 2.5 * 3600 * 1000;
    return byCategory.filter((c) => {
      const first = c.events[0];
      if (!first?.datetime) return true;
      const ms = new Date(first.datetime).getTime();
      return Math.abs(ms - targetMs) <= windowMs;
    });
  }, [clusters, activeCategories, timeScrubHoursAgo]);

  const selectedCluster = useMemo(
    () => clusters.find((c) => c.id === selectedId) ?? null,
    [clusters, selectedId],
  );

  const relatedClusters = useMemo(
    () =>
      selectedCluster ? chooseRelatedClusters(selectedCluster, visibleClusters) : [],
    [selectedCluster, visibleClusters],
  );

  return (
    <>
      <Earth />
      <Auroras />
      <Atmosphere />
      <Satellites />
      <CountryHighlight />
      <CityDots />
      <Earthquakes />
      {visibleClusters.map((c) => (
        <NewsCluster
          key={c.id}
          cluster={c}
          selected={c.id === selectedId}
          hovered={c.id === hoveredId}
          onPointerOver={() => setHover(c.id)}
          onPointerOut={() => setHover(null)}
          onClick={() => {
            selectCluster(c.id);
            flyTo(c.lat, c.lng);
          }}
        />
      ))}
      {selectedCluster &&
        relatedClusters.map((r, i) => (
          <ConnectionArc
            key={`${selectedCluster.id}-${r.id}`}
            from={selectedCluster}
            to={r}
            color={selectedCluster.color}
            delay={i * 0.4}
          />
        ))}
    </>
  );
}

export function Globe() {
  const autoRotate = useGlobeStore((s) => s.autoRotate);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  return (
    <Canvas
      camera={{ position: [0, 0.8, 5.2], fov: 38, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <Suspense fallback={null}>
        <Stars />
        <Moon />
        <GlobeContent />
        <Lightning />
        <CameraFlyer />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
        minDistance={1.15}
        maxDistance={8}
        autoRotate={autoRotate && !reduceMotion}
        autoRotateSpeed={0.18}
        makeDefault
      />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.20}
          luminanceThreshold={0.85}
          luminanceSmoothing={0.4}
          mipmapBlur
          kernelSize={KernelSize.SMALL}
        />
      </EffectComposer>
    </Canvas>
  );
}
