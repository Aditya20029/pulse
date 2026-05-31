import * as THREE from "three";

export const GLOBE_RADIUS = 1;

export function latLngToVector3(
  lat: number,
  lng: number,
  radius: number = GLOBE_RADIUS,
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function buildArcCurve(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  radius: number = GLOBE_RADIUS,
): THREE.CubicBezierCurve3 {
  const start = latLngToVector3(startLat, startLng, radius);
  const end = latLngToVector3(endLat, endLng, radius);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const arcHeight = 1 + start.distanceTo(end) * 0.45;
  const control = mid.clone().normalize().multiplyScalar(radius * arcHeight);
  const c1 = start.clone().lerp(control, 0.5);
  const c2 = end.clone().lerp(control, 0.5);
  return new THREE.CubicBezierCurve3(start, c1, c2, end);
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
