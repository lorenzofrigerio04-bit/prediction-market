"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import HomeEventTile from "@/components/home/HomeEventTile";
import { FilterChips, LoadingBlock, EmptyState } from "@/components/ui";

/** Stesso tipo evento restituito da /api/events/consigliati (feed TikTok) */
interface ConsigliatiEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string;
  probability: number;
  createdBy: { id: string; name: string | null; image: string | null };
  _count: { predictions: number; comments: number };
  isFollowing: boolean;
  fomo?: {
    countdownMs: number;
    participantsCount: number;
    votesVelocity: number;
    pointsMultiplier: number;
    isClosingSoon: boolean;
  };
}

const CONSIGLIATI_LIMIT = 50;

export default function DiscoverConsigliatiPage() {
  const [events, setEvents] = useState<ConsigliatiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/consigliati?limit=${CONSIGLIATI_LIMIT}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore di caricamento");
      }
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => e.category && set.add(e.category));
    return Array.from(set).sort();
  }, [events]);

  const filterOptions = useMemo(() => {
    const opts: { id: string; label: string }[] = [{ id: "all", label: "Tutti" }];
    categories.forEach((c) => opts.push({ id: c, label: c }));
    return opts;
  }, [categories]);

  const filteredEvents = useMemo(() => {
    if (categoryFilter === "all") return events;
    return events.filter((e) => e.category === categoryFilter);
  }, [events, categoryFilter]);

  return (
    <div className="min-h-screen discover-page">
      <Header />
      <main
        id="main-content"
        className="relative mx-auto max-w-2xl px-4 pb-[calc(5rem+var(--safe-area-inset-bottom))] pt-5 md:pb-8 md:pt-8"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-ds-h2 font-bold text-fg">Consigliati</h1>
          <Link
            href="/crea"
            className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline shrink-0"
          >
            + Crea evento
          </Link>
        </div>

        {loading ? (
          <LoadingBlock message="Caricamento eventi…" />
        ) : error ? (
          <EmptyState
            title="Errore"
            description={error}
            action={{ label: "Riprova", onClick: fetchEvents }}
          />
        ) : (
          <>
            {filterOptions.length > 1 && (
              <FilterChips
                options={filterOptions}
                value={categoryFilter}
                onChange={setCategoryFilter}
                label="Categoria"
                className="mb-4"
              />
            )}

            {filteredEvents.length === 0 ? (
              <EmptyState
                title="Nessun evento"
                description={
                  categoryFilter === "all"
                    ? "Nessun evento consigliato al momento."
                    : `Nessun evento nella categoria "${categoryFilter}".`
                }
                action={
                  categoryFilter !== "all"
                    ? { label: "Tutti", onClick: () => setCategoryFilter("all") }
                    : undefined
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4" role="list">
                {filteredEvents.map((event) => (
                  <div key={event.id} role="listitem">
                    <HomeEventTile
                      id={event.id}
                      title={event.title}
                      category={event.category}
                      closesAt={event.closesAt}
                      yesPct={Math.round(
                        typeof event.probability === "number" && Number.isFinite(event.probability)
                          ? event.probability
                          : 50
                      )}
                      predictionsCount={event._count?.predictions}
                      variant="foryou"
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
