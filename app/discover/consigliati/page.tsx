"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

/** Legge le categorie selezionate dall'URL (?categories=Scienza,Politica) per persistenza al back. */
function parseCategoriesFromSearchParams(searchParams: URLSearchParams): Set<string> {
  const c = searchParams.get("categories");
  if (!c || !c.trim()) return new Set<string>();
  return new Set(
    c
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export default function DiscoverConsigliatiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<ConsigliatiEvent[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Multi-select: inizializzato dall'URL così il filtro resta quando si torna indietro dalla pagina evento. */
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() =>
    parseCategoriesFromSearchParams(searchParams)
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  /** Allineare state all'URL quando si torna indietro (es. da pagina evento) con query diversa. */
  useEffect(() => {
    const fromUrl = parseCategoriesFromSearchParams(searchParams);
    setSelectedCategories((prev) => {
      if (prev.size !== fromUrl.size || [...prev].some((c) => !fromUrl.has(c))) return fromUrl;
      return prev;
    });
  }, [searchParams]);

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

  /** Aggiorna URL con le categorie selezionate così il back dalla pagina evento ripristina il filtro. */
  const syncUrlToCategories = useCallback(
    (categories: Set<string>) => {
      const path = "/discover/consigliati";
      const url =
        categories.size === 0
          ? path
          : `${path}?categories=${encodeURIComponent([...categories].sort().join(","))}`;
      router.replace(url, { scroll: false });
    },
    [router]
  );

  const toggleCategory = useCallback(
    (category: string) => {
      setSelectedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) next.delete(category);
        else next.add(category);
        syncUrlToCategories(next);
        return next;
      });
    },
    [syncUrlToCategories]
  );

  const clearSelection = useCallback(() => {
    setSelectedCategories(new Set());
    syncUrlToCategories(new Set());
  }, [syncUrlToCategories]);

  useEffect(() => {
    if (!categoryDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node))
        setCategoryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryDropdownOpen]);

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

        <div className="mb-4 flex items-center gap-2" ref={categoryDropdownRef}>
          <span className="text-ds-body-sm font-medium text-fg-muted shrink-0">Categoria:</span>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen((o) => !o)}
              className="flex items-center justify-between gap-2 min-h-[44px] min-w-[140px] max-w-[200px] px-3 sm:px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-fg text-left text-sm sm:text-ds-body-sm font-medium hover:bg-white/60 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg transition-colors"
              aria-expanded={categoryDropdownOpen}
              aria-haspopup="listbox"
              aria-label={`Categoria: ${selectedCategories.size === 0 ? "Tutte" : `${selectedCategories.size} selezionate`}`}
            >
              <span className="truncate">
                {selectedCategories.size === 0
                  ? "Tutte"
                  : selectedCategories.size === 1
                    ? [...selectedCategories][0]
                    : `${selectedCategories.size} categorie`}
              </span>
              <svg
                className={`w-4 h-4 shrink-0 text-fg-muted transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {categoryDropdownOpen && (
              <div
                className="absolute left-0 top-full z-50 mt-1 min-w-[200px] max-w-[min(280px,85vw)] py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/85 dark:bg-black/60 backdrop-blur-md shadow-lg max-h-[min(280px,70vh)] overflow-y-auto"
                role="listbox"
                aria-label="Seleziona categorie"
                aria-multiselectable
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCategories.size === 0}
                  onClick={() => {
                    clearSelection();
                  }}
                  className="flex w-full items-center gap-2.5 px-3 sm:px-4 py-2.5 text-left text-sm sm:text-ds-body-sm font-medium transition-colors text-fg hover:bg-white/10 dark:hover:bg-white/10"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      selectedCategories.size === 0
                        ? "border-primary bg-primary text-white"
                        : "border-white/30 bg-transparent"
                    }`}
                    aria-hidden
                  >
                    {selectedCategories.size === 0 && (
                      <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  Tutte
                </button>
                {allCategories.map((cat) => {
                  const isSelected = selectedCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleCategory(cat)}
                      className="flex w-full items-center gap-2.5 px-3 sm:px-4 py-2.5 text-left text-sm sm:text-ds-body-sm font-medium transition-colors text-fg hover:bg-white/10 dark:hover:bg-white/10"
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isSelected ? "border-primary bg-primary text-white" : "border-white/30 bg-transparent"
                        }`}
                        aria-hidden
                      >
                        {isSelected && (
                          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
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
