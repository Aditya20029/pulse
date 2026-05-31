"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Feature } from "geojson";
import { useTexture } from "@react-three/drei";
import { GLOBE_RADIUS } from "@/lib/globe-utils";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { loadWorldAtlas } from "@/lib/world-atlas";
import { findCountry, countryName } from "@/lib/country-detection";
import { buildPoliticalTexture } from "@/lib/political-canvas";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uSpecular;
  uniform sampler2D uNormal;
  uniform float uHasNight;
  uniform float uHasDetail;
  uniform vec3 uSunDir;
  uniform vec3 uAtmoColor;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 dayColor = texture2D(uDay, vUv).rgb;
    vec3 nightColor = texture2D(uNight, vUv).rgb;
    float waterMask = texture2D(uSpecular, vUv).r;
    vec3 normalOffset = (texture2D(uNormal, vUv).rgb * 2.0 - 1.0);

    // Subtle perturbation to give terrain a sense of relief
    vec3 perturbed = normalize(vWorldNormal + normalOffset * 0.18 * uHasDetail);

    vec3 lightDir = normalize(uSunDir);
    float dotNL = dot(perturbed, lightDir);

    float dayFactor = smoothstep(-0.08, 0.30, dotNL);

    vec3 lit = dayColor * (0.20 + 1.05 * max(dotNL, 0.0));
    vec3 unlit = mix(dayColor * 0.10, nightColor * 0.55, uHasNight);

    vec3 color = mix(unlit, lit, dayFactor);

    // Ocean specular highlight where sunlight hits water on the lit side
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 halfDir = normalize(viewDir + lightDir);
    float specAngle = max(dot(vWorldNormal, halfDir), 0.0);
    float spec = pow(specAngle, 70.0) * waterMask * dayFactor * uHasDetail;
    color += vec3(1.0, 0.92, 0.78) * spec * 0.30;

    float terminator = exp(-pow(dotNL * 6.0, 2.0));
    color += vec3(1.0, 0.55, 0.18) * terminator * 0.16;

    float rim = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
    color += uAtmoColor * rim * 0.07;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function computeSunDir(date: Date = new Date()): THREE.Vector3 {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const subSolarLng = -((utcHours - 12) * 15);
  const dayOfYear =
    (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 0)) /
    (1000 * 60 * 60 * 24);
  const subSolarLat = 23.44 * Math.sin(((dayOfYear - 81) / 365) * 2 * Math.PI);

  const phi = (90 - subSolarLat) * (Math.PI / 180);
  const theta = (subSolarLng + 180) * (Math.PI / 180);
  const x = -(Math.sin(phi) * Math.cos(theta));
  const z = Math.sin(phi) * Math.sin(theta);
  const y = Math.cos(phi);
  return new THREE.Vector3(x, y, z).normalize();
}

export function Earth() {
  const viewMode = useGlobeStore((s) => s.viewMode);
  const [dayMap, nightMap, specularMap, normalMap] = useTexture([
    "/textures/earth_day_8k.jpg",
    "/textures/earth_night_8k.jpg",
    "/textures/earth_specular.jpg",
    "/textures/earth_normal.jpg",
  ]);
  const [politicalTexture, setPoliticalTexture] =
    useState<THREE.Texture | null>(null);

  const [features, setFeatures] = useState<Feature[] | null>(null);
  useEffect(() => {
    loadWorldAtlas()
      .then((d) => setFeatures(d.features))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (features && !politicalTexture) {
      setPoliticalTexture(buildPoliticalTexture(features));
    }
  }, [features, politicalTexture]);

  const material = useMemo(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = 16;
    nightMap.anisotropy = 16;
    specularMap.anisotropy = 8;
    normalMap.anisotropy = 8;
    dayMap.minFilter = THREE.LinearMipmapLinearFilter;
    dayMap.magFilter = THREE.LinearFilter;
    nightMap.minFilter = THREE.LinearMipmapLinearFilter;
    nightMap.magFilter = THREE.LinearFilter;
    specularMap.minFilter = THREE.LinearMipmapLinearFilter;
    normalMap.minFilter = THREE.LinearMipmapLinearFilter;
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uDay: { value: dayMap },
        uNight: { value: nightMap },
        uSpecular: { value: specularMap },
        uNormal: { value: normalMap },
        uHasNight: { value: 1.0 },
        uHasDetail: { value: 1.0 },
        uSunDir: { value: computeSunDir() },
        uAtmoColor: { value: new THREE.Color("#7dd3fc") },
      },
    });
  }, [dayMap, nightMap, specularMap, normalMap]);

  useEffect(() => {
    if (viewMode === "political" && politicalTexture) {
      material.uniforms.uDay.value = politicalTexture;
      material.uniforms.uHasNight.value = 0.0;
      material.uniforms.uHasDetail.value = 0.0;
    } else {
      material.uniforms.uDay.value = dayMap;
      material.uniforms.uHasNight.value = 1.0;
      material.uniforms.uHasDetail.value = 1.0;
    }
    material.needsUpdate = true;
  }, [viewMode, politicalTexture, dayMap, material]);

  const setHoveredCoords = useGlobeStore((s) => s.setHoveredCoords);
  const selectRegion = useGlobeStore((s) => s.selectRegion);
  const selectCluster = useGlobeStore((s) => s.selectCluster);

  return (
    <mesh
      material={material}
      onPointerMove={(e) => {
        const p = e.point;
        const lat = (Math.asin(p.y / GLOBE_RADIUS) * 180) / Math.PI;
        const theta = Math.atan2(p.z, -p.x);
        let lng = (theta * 180) / Math.PI - 180;
        if (lng < -180) lng += 360;
        if (lng > 180) lng -= 360;
        setHoveredCoords({ lat, lng });
      }}
      onPointerOut={() => setHoveredCoords(null)}
      onClick={(e) => {
        const p = e.point;
        const lat = (Math.asin(p.y / GLOBE_RADIUS) * 180) / Math.PI;
        const theta = Math.atan2(p.z, -p.x);
        let lng = (theta * 180) / Math.PI - 180;
        if (lng < -180) lng += 360;
        if (lng > 180) lng -= 360;
        if (!features) return;
        const country = findCountry(features, lat, lng);
        const name = countryName(country);
        if (name) {
          selectRegion(name);
        } else {
          selectRegion(null);
          selectCluster(null);
        }
      }}
    >
      <sphereGeometry args={[GLOBE_RADIUS, 256, 256]} />
    </mesh>
  );
}
