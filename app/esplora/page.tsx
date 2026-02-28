"use client";

import { useState, useEffect, useCallback, useDeferredValue, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import HomeEventTile from "@/components/home/HomeEventTile";
import type { HomeEventTileVariant } from "@/components/home/HomeEventTile";
import {
  PageHeader,
  EmptyState,
} from "@/components/ui";
import FilterDropdown from "@/components/ui/FilterDropdown";
import { getDisplayTitle, isDebugTitle } from "@/lib/debug-display";
import { getCategoryNameFromSlug, categoryToSlug } from "@/lib/category-slug";

const LIMIT = 12;

export interface EsploraEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  outcome: string | null;
  probability: number;
  yesCredits: number;
  noCredits: number;
  totalCredits: number;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    predictions: number;
    comments: number;
  };
  fomo?: {
    countdownMs: number;
    participantsCount: number;
    votesVelocity: number;
    pointsMultiplier: number;
    isClosingSoon: boolean;
  };
}

interface EventsResponse {
  events: EsploraEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SortType = "popular" | "expiring" | "recent";
type StatusType = "open" | "closed" | "in_revision";

const SORT_OPTIONS: { id: SortType; label: string }[] = [
  { id: "popular", label: "Più virali" },
  { id: "recent", label: "Più recenti" },
  { id: "expiring", label: "In scadenza" },
];

const STATUS_OPTIONS: { id: StatusType; label: string }[] = [
  { id: "open", label: "Aperto" },
  { id: "closed", label: "Chiuso" },
  { id: "in_revision", label: "In revisione" },
];

function eventToTileVariant(sort: SortType): HomeEventTileVariant {
  return sort === "expiring" ? "closing" : "popular";
}

export default function EsploraPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);

  const [category, setCategory] = useState<string>(() => searchParams.get("category") ?? "tutti");
  const [status, setStatus] = useState<StatusType>(() => (searchParams.get("status") ?? "open") as StatusType);
  const [sort, setSort] = useState<SortType>(() => (searchParams.get("sort") ?? "popular") as SortType);

  const [events, setEvents] = useState<EsploraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<EventsResponse["pagination"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [openFilter, setOpenFilter] = useState<"category" | "status" | "sort" | null>(null);

  const categoryName = category === "tutti" ? null : getCategoryNameFromSlug(category, categories) ?? category;

  useEffect(() => {
    fetch("/api/events/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCategories(data?.categories ?? []))
      .catch(() => {});
  }, []);

  // Sync state from URL (e.g. back button or link from homepage)
  useEffect(() => {
    const cat = searchParams.get("category") ?? "tutti";
    const st = (searchParams.get("status") ?? "open") as StatusType;
    const so = (searchParams.get("sort") ?? "popular") as SortType;
    setCategory(cat);
    setStatus(st);
    setSort(so);
  }, [searchParams]);

  const updateUrl = useCallback((updates: { category?: string; status?: StatusType; sort?: SortType }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.category !== undefined) params.set("category", updates.category);
    if (updates.status !== undefined) params.set("status", updates.status);
    if (updates.sort !== undefined) params.set("sort", updates.sort);
    params.delete("page");
    router.replace(`/esplora?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        if (pageNum === 1) setEvents([]);
      }
      setError(null);
      try {
        const params = new URLSearchParams({
          status,
          sort,
          page: String(pageNum),
          limit: String(LIMIT),
          ...(search && { search }),
          ...(categoryName && { category: categoryName }),
        });
        const res = await fetch(`/api/events?${params}`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data: EventsResponse = await res.json();
        const list = data.events ?? [];
        if (append) {
          setEvents((prev) => {
            if (pageNum === 1) return list;
            const prevIds = new Set(prev.map((e) => e.id));
            const newEvents = list.filter((e) => !prevIds.has(e.id));
            return [...prev, ...newEvents];
          });
        } else {
          setEvents(list);
        }
        setPagination(data.pagination ?? null);
      } catch (err) {
        console.error("Esplora fetch error:", err);
        setError("Impossibile caricare gli eventi.");
        if (!append) setEvents([]);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [status, sort, search, categoryName]
  );

  const loadNextPage = useCallback(() => {
    const totalPages = pagination?.totalPages ?? 0;
    if (page >= totalPages || loading || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, true);
  }, [page, pagination?.totalPages, loading, loadingMore, fetchPage]);

  useEffect(() => {
    setSearch(deferredSearch);
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
  }, [status, sort, search, categoryName]);

  /** Aggiornamento in tempo reale del numero previsioni (polling in background quando tab visibile). */
  const ESPLORA_POLL_MS = 30_000;
  const refreshPredictionsInBackground = useCallback(async () => {
    if (typeof document === "undefined" || document.visibilityState !== "visible") return;
    try {
      const params = new URLSearchParams({
        status,
        sort,
        page: "1",
        limit: String(LIMIT),
        ...(search && { search }),
        ...(categoryName && { category: categoryName }),
      });
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      const next = (data.events ?? []) as EsploraEvent[];
      if (next.length === 0) return;
      setEvents((prev) => {
        const byId = new Map(next.map((e) => [e.id, e]));
        return prev.map((e) => byId.get(e.id) ?? e);
      });
    } catch {
      // ignore
    }
  }, [status, sort, search, categoryName]);

  useEffect(() => {
    const id = setInterval(refreshPredictionsInBackground, ESPLORA_POLL_MS);
    return () => clearInterval(id);
  }, [refreshPredictionsInBackground]);

  // Infinite scroll: observe sentinel at bottom
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) loadNextPage();
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const hasMore = page < totalPages;
  const hasFilters = !!search || status !== "open" || category !== "tutti";
  const isEmptyCatalog = !loading && !error && events.length === 0;
  const debugMode =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("debug") === "1" ||
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true");
  const variant = eventToTileVariant(sort);

  const categoryOptions = [
    { id: "tutti", label: "Tutti" },
    ...(categories.map((c) => ({ id: categoryToSlug(c), label: c }))),
  ];

  const filtered = debugMode ? events : events.filter((e) => !isDebugTitle(e.title));
  const visibleEvents = filtered.filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header />
      <main
        id="main-content"
        className="flex-1 mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 md:py-8 max-w-6xl pb-[var(--bottom-nav-total)] md:pb-8"
      >
        <PageHeader
          title="ESPLORA"
          description="Tutti gli eventi. Filtra per categoria, stato e ordine."
          align="center"
        />

        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
          <form onSubmit={handleSearch} className="w-full" role="search">
            <label htmlFor="esplora-search" className="sr-only">
              Cerca eventi
            </label>
            <div className="relative">
              <input
                id="esplora-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cerca eventi..."
                className="w-full min-h-[44px] sm:min-h-[48px] pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-ds-body ds-tap-target"
                aria-label="Cerca eventi"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 min-h-[32px] sm:min-h-[36px] px-3 sm:px-4 rounded-lg sm:rounded-xl bg-primary text-white text-xs sm:text-ds-body-sm font-semibold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Cerca
              </button>
            </div>
          </form>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <FilterDropdown
              label="Categoria"
              options={categoryOptions}
              value={category}
              onChange={(id) => {
                setCategory(id);
                updateUrl({ category: id });
                setPage(1);
                setOpenFilter(null);
              }}
              open={openFilter === "category"}
              onOpenChange={(o) => setOpenFilter(o ? "category" : null)}
              onOpen={() => setOpenFilter("category")}
            />
            <FilterDropdown
              label="Stato"
              options={STATUS_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={status}
              onChange={(id) => {
                setStatus(id as StatusType);
                updateUrl({ status: id as StatusType });
                setPage(1);
                setOpenFilter(null);
              }}
              open={openFilter === "status"}
              onOpenChange={(o) => setOpenFilter(o ? "status" : null)}
              onOpen={() => setOpenFilter("status")}
            />
            <FilterDropdown
              label="Ordine"
              options={SORT_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={sort}
              onChange={(id) => {
                setSort(id as SortType);
                updateUrl({ sort: id as SortType });
                setPage(1);
                setOpenFilter(null);
              }}
              open={openFilter === "sort"}
              onOpenChange={(o) => setOpenFilter(o ? "sort" : null)}
              onOpen={() => setOpenFilter("sort")}
            />
          </div>
        </div>

        {error ? (
          <EmptyState
            title="Qualcosa è andato storto. Riprova tra poco."
            description={error}
            action={{ label: "Riprova", onClick: () => fetchPage(1, false) }}
          />
        ) : loading ? (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-4 md:gap-6" aria-busy="true" aria-live="polite">
            {Array.from({ length: LIMIT }, (_, i) => (
              <div key={i} className="min-h-[175px] sm:min-h-[195px] rounded-lg bg-white/5 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : isEmptyCatalog ? (
          <EmptyState
            title="Nessun evento con questi filtri."
            description="Prova a cambiare categoria, stato o ordine."
            action={
              hasFilters
                ? {
                    label: "Azzera filtri",
                    onClick: () => {
                      setSearch("");
                      setSearchInput("");
                      setCategory("tutti");
                      setStatus("open");
                      setSort("popular");
                      setPage(1);
                      updateUrl({ category: "tutti", status: "open", sort: "popular" });
                    },
                  }
                : undefined
            }
          />
        ) : (
          <>
            <p className="text-ds-body-sm text-fg-muted mb-3 sm:mb-4">
              {total} {total === 1 ? "evento" : "eventi"}
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-4 md:gap-6">
              {visibleEvents.map((event) => (
                <HomeEventTile
                  key={event.id}
                  id={event.id}
                  title={getDisplayTitle(event.title, debugMode)}
                  category={event.category}
                  closesAt={event.closesAt}
                  yesPct={Math.round(event.probability)}
                  predictionsCount={event._count?.predictions}
                  variant={variant}
                  resolved={event.resolved}
                />
              ))}
            </div>

            {/* Sentinel per scroll infinito */}
            <div ref={sentinelRef} className="min-h-[1px] w-full" aria-hidden />
            {loadingMore && (
              <div className="py-4 flex justify-center" aria-live="polite">
                <span className="text-ds-body-sm text-fg-muted">Caricamento…</span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
