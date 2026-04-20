"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FootballHomepagePayload } from "@/types/homepage";

const REFRESH_MS = 30_000;
const CACHE_TTL_MS = 45_000;

type CacheEntry = {
  updatedAt: number;
  payload: FootballHomepagePayload;
};

// Module-level cache so the data survives component remounts within a session.
const cache = new Map<string, CacheEntry>();

export interface UseHomepageDataResult {
  data: FootballHomepagePayload | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useHomepageData(
  endpoint = "/api/feed/football-homepage"
): UseHomepageDataResult {
  const cached = cache.get(endpoint);
  const hasWarm = !!cached && Date.now() - cached.updatedAt <= CACHE_TTL_MS;

  const [data, setData] = useState<FootballHomepagePayload | null>(
    hasWarm ? cached.payload : null
  );
  const [loading, setLoading] = useState(!hasWarm);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = (await res.json()) as FootballHomepagePayload;
        setData(payload);
        cache.set(endpoint, { updatedAt: Date.now(), payload });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Errore di rete";
        if (!silent) setError(msg);
      } finally {
        inFlightRef.current = false;
        if (!silent) setLoading(false);
      }
    },
    [endpoint]
  );

  useEffect(() => {
    fetchData(hasWarm);
  }, [fetchData, hasWarm]);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      fetchData(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, refresh: () => fetchData(false) };
}
