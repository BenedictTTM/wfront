// lib/storage.ts — SSR-safe, typed wrapper for browser localStorage
// Prevents window crashes during Next.js SSR/prerender and handles JSON serialization errors gracefully.

const inMemoryStore: Record<string, string> = {};

export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") {
      const mem = inMemoryStore[key];
      if (mem === undefined) return fallback;
      try {
        return JSON.parse(mem) as T;
      } catch {
        return fallback;
      }
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  getItemString(key: string, fallback = ""): string {
    if (typeof window === "undefined") {
      return inMemoryStore[key] ?? fallback;
    }
    try {
      return window.localStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): void {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    if (typeof window === "undefined") {
      inMemoryStore[key] = serialized;
      return;
    }
    try {
      window.localStorage.setItem(key, serialized);
    } catch {
      // Ignore quota exceeded or privacy-mode storage blocks
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") {
      delete inMemoryStore[key];
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors
    }
  },
};
