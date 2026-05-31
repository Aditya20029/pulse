"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Cluster } from "@/lib/types";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/globe-utils";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { getCategoryIcon } from "@/lib/cluster-icons";

const haloVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const haloFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSelected;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.5);
    float pulse = 0.6 + 0.4 * sin(uTime * 2.5);
    float boost = mix(1.0, 1.9, uSelected);
    float alpha = fresnel * (0.15 + uIntensity * 0.20) * pulse * boost;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface Props {
  cluster: Cluster;
  selected: boolean;
  hovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}

export function NewsCluster({
  cluster,
  selected,
  hovered,
  onPointerOver,
  onPointerOut,
  onClick,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const haloMatRef = useRef<THREE.ShaderMaterial>(null);
  const spriteMatRef = useRef<THREE.SpriteMaterial>(null);

  const position = useMemo(
    () => latLngToVector3(cluster.lat, cluster.lng, GLOBE_RADIUS * 1.01),
    [cluster.lat, cluster.lng],
  );

  const color = useMemo(() => new THREE.Color(cluster.color), [cluster.color]);

  const haloMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: haloVert,
        fragmentShader: haloFrag,
        uniforms: {
          uColor: { value: color.clone() },
          uTime: { value: 0 },
          uIntensity: { value: cluster.intensity },
          uSelected: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [color, cluster.intensity],
  );

  const viewMode = useGlobeStore((s) => s.viewMode);
  const someoneSelected = useGlobeStore(
    (s) => s.selectedClusterId !== null && s.selectedClusterId !== cluster.id,
  );
  const modeMultiplier = viewMode === "heatmap" ? 2.4 : 1;
  const baseScale = (0.020 + cluster.intensity * 0.022) * modeMultiplier;

  const DEFAULT_CAMERA_DIST = 5.2;
  const FADE_START = 1.7; // halos start fading below this zoom distance

  useFrame((state) => {
    const cameraDist = state.camera.position.length();
    if (haloMatRef.current) {
      haloMatRef.current.uniforms.uTime.value =
        state.clock.elapsedTime + cluster.lat;
      haloMatRef.current.uniforms.uSelected.value = selected ? 1 : 0;
    }
    if (groupRef.current) {
      const t = state.clock.elapsedTime * 2.3 + cluster.lat * 0.7;
      const pulse = 1 + Math.sin(t) * 0.12;
      const hoverBoost = hovered || selected ? 1.35 : 1;
      // Linear distance scaling clamped at 0.2 floor so clusters shrink hard
      // when the camera is right above the surface. At default zoom they sit
      // at full size.
      const ratio = cameraDist / DEFAULT_CAMERA_DIST;
      const distScale = Math.max(0.2, Math.min(1.15, ratio));
      groupRef.current.scale.setScalar(baseScale * pulse * hoverBoost * distScale);
    }
    if (spriteMatRef.current) {
      const base = hovered || selected ? 1 : 0.9;
      const dim = someoneSelected ? 0.28 : 1;
      spriteMatRef.current.opacity = base * dim;
    }
    if (haloMatRef.current) {
      const dim = someoneSelected ? 0.3 : 1;
      // Fade the halo out as the camera approaches the surface so close-zoom
      // doesn't get drowned by overlapping translucent spheres.
      const fade = Math.max(0, Math.min(1, (cameraDist - 1.15) / (FADE_START - 1.15)));
      haloMatRef.current.uniforms.uIntensity.value =
        cluster.intensity * dim * fade;
    }
  });

  haloMaterial.uniforms.uColor.value = color;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        onPointerOver();
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "";
        onPointerOut();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <sprite scale={[1.5, 1.5, 1]}>
        <spriteMaterial
          ref={spriteMatRef}
          map={getCategoryIcon(cluster.category, cluster.color)}
          transparent
          opacity={0.9}
          toneMapped={false}
          depthWrite={false}
        />
      </sprite>
      <mesh scale={1.0}>
        <sphereGeometry args={[1, 24, 24]} />
        <primitive
          attach="material"
          object={haloMaterial}
          ref={haloMatRef}
        />
      </mesh>
    </group>
  );
}
