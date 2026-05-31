"use client";

import { feature } from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";

const URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";

export interface WorldData {
  countries: FeatureCollection;
  features: Feature[];
}

let cache: Promise<WorldData> | null = null;

export function loadWorldAtlas(): Promise<WorldData> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadWorldAtlas is client-only"));
  }
  if (!cache) {
    cache = fetch(URL)
      .then((r) => {
        if (!r.ok) throw new Error(`world-atlas ${r.status}`);
        return r.json();
      })
      .then((topo) => {
        const countries = feature(
          topo,
          topo.objects.countries,
        ) as unknown as FeatureCollection;
        return { countries, features: countries.features };
      })
      .catch((err) => {
        cache = null;
        throw err;
      });
  }
  return cache;
}
