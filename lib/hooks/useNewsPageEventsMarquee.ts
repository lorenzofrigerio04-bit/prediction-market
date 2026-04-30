"use client";

import { useState, useEffect } from "react";
import type { FootballEvent } from "@/types/homepage";

type ApiEventRow = {
  id: string;
  title: string;
  category: string;
  closesAt: string | Date;
  createdAt: string | Date;
  probability?: number;
  totalCredits?: number | null;
  imageUrl?: string | null;
  marketType?: string | null;
  outcomes?: unknown;
  outcomeProbabilities?: unknown;
  _count?: { predictions?: number; comments?: number };
};

function toIso(d: string | Date | undefined): string {
  if (d == null) return new Date().toISOString();
  return typeof d === "string" ? d : d.toISOString();
}

export function mapApiRowToFootballEvent(e: ApiEventRow): FootballEvent {
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    closesAt: toIso(e.closesAt),
    createdAt: toIso(e.createdAt),
    yesPct: Math.round(e.probability ?? 50),
    predictionsCount: e._count?.predictions ?? 0,
    totalCredits: e.totalCredits ?? 0,
    aiImageUrl: e.imageUrl ?? null,
    marketType: e.marketType ?? null,
    outcomes: e.outcomes as FootballEvent["outcomes"],
    outcomeProbabilities: e.outcomeProbabilities as FootballEvent["outcomeProbabilities"],
  };
}

export function useNewsPageEventsMarquee(limit = 28): {
  events: FootballEvent[];
  ready: boolean;
} {
  const [events, setEvents] = useState<FootballEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let raw: ApiEventRow[] = [];
        const primary = await fetch(`/api/events/news-marquee?limit=${limit}`, {
          cache: "no-store",
        });
        if (primary.ok) {
          const data = (await primary.json()) as { ok?: boolean; events?: ApiEventRow[] };
          raw = data.events ?? [];
        }
        if (raw.length < Math.min(4, limit) && !cancelled) {
          const fallback = await fetch(
            `/api/events?status=open&sort=popular&page=1&limit=${limit}`,
            { cache: "no-store" }
          );
          if (fallback.ok) {
            const data = (await fallback.json()) as { events?: ApiEventRow[] };
            raw = data.events ?? [];
          }
        }
        if (cancelled) return;
        setEvents(raw.map(mapApiRowToFootballEvent));
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { events, ready };
}
