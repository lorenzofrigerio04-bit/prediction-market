"use client";

import { useState, useEffect } from "react";
import type { NewsArticleCardModel } from "@/components/news/NewsCard";
import type { NewsFormat } from "@/lib/news-engine/types";

export type HomepageNewsTickerItem = NewsArticleCardModel;

export function useHomepageNewsTickers(limit = 28): {
  items: HomepageNewsTickerItem[];
  ready: boolean;
} {
  const [items, setItems] = useState<HomepageNewsTickerItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/news?limit=${limit}`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          ok?: boolean;
          articles?: {
            id: string;
            slug: string;
            format: NewsFormat;
            title: string;
            excerpt: string | null;
            body: string;
            authorPersona: string;
            readingTimeMin: number;
            publishedAt: string;
          }[];
        };
        const raw = data.articles ?? [];
        if (cancelled) return;
        setItems(
          raw.map((a) => ({
            id: a.id,
            slug: a.slug,
            format: a.format,
            title: a.title?.trim() || "News",
            excerpt: a.excerpt ?? "",
            body: a.body ?? "",
            authorPersona: a.authorPersona,
            readingTimeMin: a.readingTimeMin,
            publishedAt:
              typeof a.publishedAt === "string"
                ? a.publishedAt
                : new Date(a.publishedAt as unknown as Date).toISOString(),
          }))
        );
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { items, ready };
}
