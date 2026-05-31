export type Category =
  | "conflict"
  | "politics"
  | "economy"
  | "environment"
  | "wildlife"
  | "tech"
  | "science"
  | "health"
  | "culture"
  | "other";

export const CATEGORY_COLORS: Record<Category, string> = {
  conflict: "#FF3B3B",
  politics: "#FFB800",
  economy: "#3B82F6",
  environment: "#22C55E",
  wildlife: "#84CC16",
  tech: "#A855F7",
  science: "#06B6D4",
  health: "#F472B6",
  culture: "#FB923C",
  other: "#64748B",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  conflict: "Conflict",
  politics: "Politics",
  economy: "Economy",
  environment: "Climate",
  wildlife: "Wildlife",
  tech: "Technology",
  science: "Science",
  health: "Health",
  culture: "Culture",
  other: "Other",
};

export interface RawEvent {
  id: string;
  lat: number;
  lng: number;
  title: string;
  url: string;
  source: string;
  datetime: string;
  tone: number;
  category: Category;
}

export interface Cluster {
  id: string;
  lat: number;
  lng: number;
  events: RawEvent[];
  intensity: number;
  category: Category;
  color: string;
  dominantTitle: string;
}

export interface GlobeFeedResponse {
  clusters: Cluster[];
  fetchedAt: string;
  totalEvents: number;
}

export interface FeedHeadline {
  id: string;
  title: string;
  source: string;
  lat: number;
  lng: number;
  category: Category;
  url: string;
  datetime: string;
}

export interface BriefingResponse {
  summary: string;
  significance: string;
  connected_events: string[];
  historical_parallels: string;
  key_actors: string[];
  severity: number;
  tone_forecast_12h?: number;
  tone_forecast_reasoning?: string;
}
