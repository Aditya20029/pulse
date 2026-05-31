import {
  CATEGORY_COLORS,
  Category,
  Cluster,
  RawEvent,
} from "./types";

function mode<T>(arr: T[]): T {
  const counts = new Map<T, number>();
  let best: T = arr[0];
  let bestCount = 0;
  for (const item of arr) {
    const next = (counts.get(item) ?? 0) + 1;
    counts.set(item, next);
    if (next > bestCount) {
      best = item;
      bestCount = next;
    }
  }
  return best;
}

export function clusterEvents(
  events: RawEvent[],
  radiusKm: number = 250,
): Cluster[] {
  if (events.length === 0) return [];
  const cellSize = radiusKm / 111;
  const grid = new Map<string, RawEvent[]>();

  for (const event of events) {
    const cellLat = Math.floor(event.lat / cellSize);
    const cellLng = Math.floor(event.lng / cellSize);
    const cellKey = `${cellLat},${cellLng}`;
    const bucket = grid.get(cellKey);
    if (bucket) {
      bucket.push(event);
    } else {
      grid.set(cellKey, [event]);
    }
  }

  return Array.from(grid.entries()).map(([key, cellEvents]) => {
    const centroidLat =
      cellEvents.reduce((s, e) => s + e.lat, 0) / cellEvents.length;
    const centroidLng =
      cellEvents.reduce((s, e) => s + e.lng, 0) / cellEvents.length;
    const dominantCategory: Category = mode(cellEvents.map((e) => e.category));
    const sortedByTone = [...cellEvents].sort(
      (a, b) => Math.abs(b.tone) - Math.abs(a.tone),
    );
    const dominantTitle = sortedByTone[0]?.title ?? cellEvents[0].title;

    return {
      id: key,
      lat: centroidLat,
      lng: centroidLng,
      events: cellEvents,
      intensity: Math.min(0.25 + cellEvents.length / 15, 1),
      category: dominantCategory,
      color: CATEGORY_COLORS[dominantCategory],
      dominantTitle,
    };
  });
}
