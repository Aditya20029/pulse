"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Bookmark {
  id: string;
  name: string;
  clusterId: string | null;
  region: string | null;
  timeScrubHoursAgo: number | null;
  createdAt: number;
}

interface BookmarksState {
  bookmarks: Bookmark[];
  recentSearches: string[];
  addBookmark: (b: Omit<Bookmark, "id" | "createdAt">) => void;
  removeBookmark: (id: string) => void;
  pushSearch: (q: string) => void;
}

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set) => ({
      bookmarks: [],
      recentSearches: [],
      addBookmark: (b) =>
        set((s) => ({
          bookmarks: [
            { ...b, id: `bm-${Date.now()}`, createdAt: Date.now() },
            ...s.bookmarks,
          ].slice(0, 30),
        })),
      removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
      pushSearch: (q) =>
        set((s) => {
          const trimmed = q.trim();
          if (!trimmed) return s;
          const filtered = s.recentSearches.filter(
            (x) => x.toLowerCase() !== trimmed.toLowerCase(),
          );
          return { recentSearches: [trimmed, ...filtered].slice(0, 8) };
        }),
    }),
    { name: "pulse-bookmarks" },
  ),
);
