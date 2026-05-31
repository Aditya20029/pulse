"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { MAJOR_CITIES } from "@/lib/cities";
import { GLOBE_RADIUS, latLngToVector3 } from "@/lib/globe-utils";

const vertexShader = /* glsl */ `
  attribute float size;
  uniform float uPixel;
  varying float vAlpha;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uPixel;
    vAlpha = 1.0;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    float core = smoothstep(0.5, 0.0, dist);
    if (core < 0.05) discard;
    vec3 color = vec3(1.0, 0.95, 0.78);
    gl_FragColor = vec4(color, core * uOpacity);
  }
`;

export function CityDots() {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();

  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(MAJOR_CITIES.length * 3);
    const sizes = new Float32Array(MAJOR_CITIES.length);
    MAJOR_CITIES.forEach((c, i) => {
      const v = latLngToVector3(c.lat, c.lng, GLOBE_RADIUS * 1.002);
      positions[i * 3 + 0] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
      sizes[i] = 2.5;
    });
    return { positions, sizes };
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uOpacity: { value: 0 },
          uPixel: { value: 4.0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame(() => {
    const dist = camera.position.length();
    const opacity = THREE.MathUtils.clamp((3.2 - dist) / 1.4, 0, 1);
    material.uniforms.uOpacity.value = opacity * 0.85;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <primitive attach="material" object={material} />
    </points>
  );
}
