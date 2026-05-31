"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { GLOBE_RADIUS } from "@/lib/globe-utils";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uSunDir;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float alpha = tex.r * 0.45;
    float dotNL = max(dot(vWorldNormal, normalize(uSunDir)), 0.0);
    float lighting = 0.15 + 0.85 * dotNL;
    vec3 color = vec3(0.92, 0.94, 0.98) * lighting;
    gl_FragColor = vec4(color, alpha);
  }
`;

export function Clouds() {
  const ref = useRef<THREE.Mesh>(null);
  const cloudMap = useTexture("/textures/earth_clouds.png");

  const material = useMemo(() => {
    cloudMap.anisotropy = 8;
    cloudMap.minFilter = THREE.LinearMipmapLinearFilter;
    cloudMap.magFilter = THREE.LinearFilter;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMap: { value: cloudMap },
        uSunDir: { value: new THREE.Vector3(1, 0.3, 0.5).normalize() },
      },
      transparent: true,
      depthWrite: false,
    });
  }, [cloudMap]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.006;
    }
  });

  return (
    <mesh ref={ref} material={material}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.008, 128, 128]} />
    </mesh>
  );
}
