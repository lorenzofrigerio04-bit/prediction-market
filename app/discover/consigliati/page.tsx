"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import HomeEventTile from "@/components/home/HomeEventTile";
import { LoadingBlock, EmptyState } from "@/components/ui";

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

const CONSIGLIATI_PAGE_SIZE = 50;

/** Shuffle array con seed per ordine riproducibile (solo per ordine chip categorie). */
function shuffleWithSeed<T>(arr: T[], seed?: string): T[] {
  const out = [...arr];
  const s = seed ?? `${Date.now()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  for (let i = out.length - 1; i > 0; i--) {
    h = (Math.imul(31, h) + i) | 0;
    const j = Math.abs(h) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function DiscoverConsigliatiPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ConsigliatiEvent[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Multi-select: set vuoto = "Tutti" (feed personalizzato); altrimenti API restituisce tutti gli eventi di quelle categorie (virality). */
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const buildConsigliatiUrl = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(CONSIGLIATI_PAGE_SIZE));
      params.set("offset", String(offset));
      if (selectedCategories.size > 0) {
        params.set("categories", [...selectedCategories].join(","));
      }
      return `/api/events/consigliati?${params.toString()}`;
    },
    [selectedCategories]
  );

  const fetchEvents = useCallback(
    async (append = false) => {
      const offset = append ? events.length : 0;
      if (offset > 0) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      if (!append) setHasMore(true);
      try {
        const url = buildConsigliatiUrl(offset);
        const res = await fetch(url);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Errore di caricamento");
        }
        const data = await res.json();
        const next = data.events ?? [];
        if (append) {
          const seen = new Set(events.map((e) => e.id));
          const newEvents = next.filter((e: ConsigliatiEvent) => !seen.has(e.id));
          setEvents((prev) => [...prev, ...newEvents]);
        } else {
          setEvents(next);
        }
        setHasMore(data.pagination?.hasMore ?? false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Errore di rete");
        if (!append) setEvents([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildConsigliatiUrl, events.length]
  );

  /** Primo caricamento e quando cambiano le categorie selezionate: ricarica da zero. */
  const loadFromStart = useCallback(() => {
    setEvents([]);
    fetchEvents(false);
  }, [fetchEvents]);

  useEffect(() => {
    loadFromStart();
  }, [selectedCategories]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/events/categories");
      if (res.ok) {
        const data = await res.json();
        setAllCategories(data.categories ?? []);
      }
    } catch {
      setAllCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /** Categorie da mostrare nella barra: tutte, ordine random (stabile per sessione). */
  const categoriesShuffled = useMemo(
    () => shuffleWithSeed(allCategories, "consigliati-categories"),
    [allCategories]
  );

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCategories(new Set());
  }, []);

  /** Scroll infinito: sentinel in fondo alla lista, quando entra in view carica altra pagina. */
  useEffect(() => {
    if (!hasMore || loadingMore || loading || events.length === 0) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchEvents(true);
      },
      { rootMargin: "200px", threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading, events.length, fetchEvents]);

  const displayedEvents = events;

  return (
    <div className="min-h-screen discover-page">
      <Header />

      {/* Tab bar + strip link: come in /discover, sotto il link passa alla visione verticale */}
      <div className="discover-tab-bar-wrapper sticky top-[var(--header-height,3.5rem)] z-30">
        <div className="discover-tab-bar">
          <div className="mx-auto px-4 max-w-2xl">
            <div className="flex">
              <button
                type="button"
                onClick={() => router.push("/discover?tab=seguiti")}
                className="flex-1 py-3.5 text-center text-sm font-semibold transition-colors border-b-2 border-transparent"
              >
                Seguiti
              </button>
              <span
                className="flex-1 py-3.5 text-center text-sm font-semibold transition-colors border-b-2 discover-tab-active border-primary"
                aria-current="page"
              >
                Consigliati
              </span>
            </div>
          </div>
        </div>
        <div className="discover-consigliati-strip-zone discover-consigliati-strip-zone--generale md:hidden">
          <Link
            href="/discover"
            className="discover-consigliati-strip discover-consigliati-strip--generale flex items-center justify-center py-3 px-4"
            aria-label="Passa alla visione verticale degli eventi consigliati"
          >
            <span className="discover-consigliati-strip-text font-medium uppercase text-fg-muted hover:text-fg">
              -passa alla visione verticale-
            </span>
          </Link>
        </div>
      </div>

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
            {/* Barra Categorie: tutte le categorie, multi-selezione */}
            <div className="mb-4">
              <p className="text-ds-caption font-semibold text-fg-muted uppercase tracking-wider mb-2">
                Categorie
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap md:overflow-visible">
                <button
                  type="button"
                  onClick={clearSelection}
                  className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl font-semibold text-ds-body-sm transition-all duration-ds-normal ease-ds-ease focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ds-tap-target ${
                    selectedCategories.size === 0
                      ? "chip-selected"
                      : "box-raised text-fg-muted hover:border-primary/25"
                  }`}
                >
                  Tutti
                </button>
                {categoriesShuffled.map((cat) => {
                  const isSelected = selectedCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl font-semibold text-ds-body-sm transition-all duration-ds-normal ease-ds-ease focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ds-tap-target ${
                        isSelected
                          ? "chip-selected"
                          : "box-raised text-fg-muted hover:border-primary/25"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {displayedEvents.length === 0 ? (
              <EmptyState
                title="Nessun evento"
                description={
                  selectedCategories.size === 0
                    ? "Nessun evento consigliato al momento."
                    : selectedCategories.size === 1
                      ? `Nessun evento nella categoria "${Array.from(selectedCategories)[0]}".`
                      : "Nessun evento nelle categorie selezionate."
                }
                action={
                  selectedCategories.size > 0
                    ? { label: "Tutti", onClick: clearSelection }
                    : undefined
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4" role="list">
                  {displayedEvents.map((event) => (
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
                <div ref={loadMoreRef} className="min-h-[1px]" aria-hidden />
                {loadingMore && (
                  <div className="flex justify-center py-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
