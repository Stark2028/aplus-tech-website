"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "aplus_searches";
const MAX_RECENT = 5;

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((q) => q !== trimmed)].slice(0, MAX_RECENT);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { recent, add, clear };
}
