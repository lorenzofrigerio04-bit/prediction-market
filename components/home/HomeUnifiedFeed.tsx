"use client";

import { useState, useEffect, useCallback } from "react";
import { HomeFeedByCategory, type HomeSection } from "./HomeFeedByCategory";

export interface HomeUnifiedFeedProps {
  onEventNavigate?: () => void;
}

export function HomeUnifiedFeed({ onEventNavigate }: HomeUnifiedFeedProps) {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feed/home-unified");
      if (!res.ok) throw new Error("Errore di caricamento");
      const data = await res.json();
      setSections((data.sections ?? []) as HomeSection[]);
    } catch {
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  return (
    <HomeFeedByCategory
      sections={sections}
      loading={loading}
      variant="popular"
      onEventNavigate={onEventNavigate}
    />
  );
}
