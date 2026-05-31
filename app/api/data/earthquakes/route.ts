import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 600;

interface USGSFeature {
  type: "Feature";
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    title: string;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
  id: string;
}

interface Quake {
  id: string;
  lat: number;
  lng: number;
  depth: number;
  magnitude: number;
  place: string;
  time: number;
  url: string;
}

const URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson";

async function fetchUSGS(): Promise<Quake[]> {
  const ac = new AbortController();
  const tid = setTimeout(() => ac.abort(), 6000);
  try {
    const res = await fetch(URL, {
      signal: ac.signal,
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const features: USGSFeature[] = data.features ?? [];
    return features
      .map((f) => {
        const [lng, lat, depth] = f.geometry.coordinates ?? [0, 0, 0];
        return {
          id: f.id,
          lat,
          lng,
          depth,
          magnitude: f.properties.mag,
          place: f.properties.place,
          time: f.properties.time,
          url: f.properties.url,
        };
      })
      .filter((q) => typeof q.lat === "number" && typeof q.lng === "number")
      .slice(0, 40);
  } catch {
    return [];
  } finally {
    clearTimeout(tid);
  }
}

const FALLBACK: Quake[] = [
  { id: "fb-1", lat: 38.0, lng: 142.4, depth: 30, magnitude: 5.6, place: "Off Tohoku", time: Date.now() - 3.6e6, url: "" },
  { id: "fb-2", lat: -33.4, lng: -70.7, depth: 40, magnitude: 5.1, place: "Central Chile", time: Date.now() - 9e6, url: "" },
  { id: "fb-3", lat: 40.5, lng: 28.8, depth: 15, magnitude: 4.8, place: "Marmara Sea", time: Date.now() - 12e6, url: "" },
  { id: "fb-4", lat: -8.6, lng: 116.0, depth: 22, magnitude: 5.3, place: "Lombok Region", time: Date.now() - 18e6, url: "" },
  { id: "fb-5", lat: 60.1, lng: -150.0, depth: 60, magnitude: 4.9, place: "Southern Alaska", time: Date.now() - 4.5e6, url: "" },
];

export async function GET() {
  let quakes = await fetchUSGS();
  if (quakes.length === 0) quakes = FALLBACK;
  return NextResponse.json(
    { quakes, fetchedAt: new Date().toISOString() },
    { headers: { "cache-control": "s-maxage=600, stale-while-revalidate=1200" } },
  );
}
