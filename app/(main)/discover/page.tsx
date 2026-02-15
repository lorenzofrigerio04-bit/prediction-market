"use client";

import { useState, useEffect, useCallback, useDeferredValue } from "react";
import EventCard from "@/components/EventCard";
import MarketCardSkeleton from "@/components/discover/MarketCardSkeleton";
import type { EventCardEvent } from "@/components/EventCard";
import {
  PageHeader,
  EmptyState,
  FilterChips,
} from "@/components/ui";

export interface DiscoverEvent {
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
}

interface EventsResponse {
  events: DiscoverEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SortType = "popular" | "expiring" | "recent" | "discussed";
type StatusType = "open" | "closed" | "all";
type DeadlineType = "" | "24h" | "7d";

const SORT_OPTIONS: { id: SortType; label: string }[] = [
  { id: "popular", label: "In tendenza" },
  { id: "recent", label: "Più recenti" },
  { id: "expiring", label: "In scadenza" },
];

const STATUS_OPTIONS: { id: StatusType; label: string }[] = [
  { id: "open", label: "Aperti" },
  { id: "closed", label: "Chiusi" },
  { id: "all", label: "Tutti" },
];

const DEADLINE_OPTIONS: { id: DeadlineType; label: string }[] = [
  { id: "", label: "Tutti" },
  { id: "24h", label: "Prossime 24h" },
  { id: "7d", label: "Prossimi 7 giorni" },
];

const SKELETON_COUNT = 6;

export default function DiscoverPage() {
  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [status, setStatus] = useState<StatusType>("open");
  const [deadline, setDeadline] = useState<DeadlineType>("");
  const [sort, setSort] = useState<SortType>("popular");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<EventsResponse["pagination"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/events/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        status,
        sort,
        page: String(page),
        limit: "12",
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(status === "open" && deadline && { deadline }),
      });
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data: EventsResponse = await res.json();
      setEvents(data.events ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error("Discover fetch error:", err);
      setError("Impossibile caricare gli eventi.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [status, sort, page, search, selectedCategory, deadline]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setSearch(deferredSearch);
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;
  const hasFilters = !!search || !!selectedCategory || status !== "open" || !!deadline;
  const isEmptyCatalog = !loading && !error && events.length === 0;

  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-6xl">
        <PageHeader
          title="Eventi"
          description="Cerca, filtra e ordina gli eventi. Fai la tua previsione su quelli che preferisci."
        />

        <form onSubmit={handleSearch} className="mb-6" role="search">
          <label htmlFor="discover-search" className="sr-only">
            Cerca eventi
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" aria-hidden>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              id="discover-search"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca eventi per parola chiave..."
              className="w-full min-h-[48px] pl-12 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary input-neon-focus text-ds-body ds-tap-target"
              aria-label="Cerca eventi"
              autoComplete="off"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] px-4 rounded-xl bg-primary text-white text-ds-body-sm font-semibold hover:bg-primary-hover border border-white/20 shadow-[0_0_16px_-4px_rgba(var(--primary-glow),0.4)] hover:shadow-[0_0_20px_-4px_rgba(var(--primary-glow),0.5)] transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Cerca
            </button>
          </div>
        </form>

        <div className="mb-6 space-y-4">
          <FilterChips
            label="Stato"
            options={STATUS_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
            value={status}
            onChange={(id) => {
              setStatus(id as StatusType);
              if (id !== "open") setDeadline("");
              setPage(1);
            }}
          />
          {status === "open" && (
            <FilterChips
              label="Scadenza"
              options={DEADLINE_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={deadline}
              onChange={(id) => {
                setDeadline(id as DeadlineType);
                setPage(1);
              }}
            />
          )}
          <FilterChips
            label="Ordina per"
            options={SORT_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
            value={sort}
            onChange={(id) => {
              setSort(id as SortType);
              setPage(1);
            }}
          />
          {categories.length > 0 && (
            <FilterChips
              label="Categoria"
              options={[{ id: "", label: "Tutte" }, ...categories.map((c) => ({ id: c, label: c }))]}
              value={selectedCategory}
              onChange={(id) => {
                setSelectedCategory(id);
                setPage(1);
              }}
            />
          )}
        </div>

        {error ? (
          <EmptyState
            title="Errore di caricamento"
            description={error}
            action={{ label: "Riprova", onClick: () => fetchEvents() }}
          />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <MarketCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : isEmptyCatalog ? (
          <EmptyState
            title={hasFilters ? "Nessun evento trovato" : "Ancora nessun evento"}
            description={
              hasFilters ? (
                <>
                  <p>Nessun evento con questi filtri.</p>
                  <p className="text-ds-body-sm text-fg-subtle mt-2">
                    Prova a cambiare categoria, stato o scadenza.
                  </p>
                </>
              ) : (
                <p>Torna a breve per scoprire i primi eventi di previsione.</p>
              )
            }
            action={
              hasFilters
                ? {
                    label: "Azzera filtri",
                    onClick: () => {
                      setSearch("");
                      setSearchInput("");
                      setSelectedCategory("");
                      setStatus("open");
                      setDeadline("");
                      setSort("popular");
                      setPage(1);
                    },
                  }
                : undefined
            }
          />
        ) : (
          <>
            <p className="text-ds-body-sm text-fg-muted mb-4">
              {total} {total === 1 ? "evento" : "eventi"} trovati
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={
                    {
                      id: event.id,
                      title: event.title,
                      description: event.description,
                      category: event.category,
                      closesAt: event.closesAt,
                      probability: event.probability,
                      totalCredits: event.totalCredits,
                      yesCredits: event.yesCredits,
                      noCredits: event.noCredits,
                      _count: event._count,
                    } satisfies EventCardEvent
                  }
                />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-2 flex-wrap"
                aria-label="Paginazione"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="min-h-[44px] px-4 rounded-xl font-semibold text-ds-body-sm border border-white/10 bg-white/5 text-fg hover:bg-white/10 hover:border-primary/25 hover:shadow-[0_0_12px_-4px_rgba(var(--primary-glow),0.2)] disabled:opacity-50 disabled:pointer-events-none disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Precedente
                </button>
                <span className="min-h-[44px] px-4 flex items-center text-fg-muted text-ds-body-sm font-medium">
                  Pagina {page} di {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="min-h-[44px] px-4 rounded-xl font-semibold text-ds-body-sm border border-white/10 bg-white/5 text-fg hover:bg-white/10 hover:border-primary/25 hover:shadow-[0_0_12px_-4px_rgba(var(--primary-glow),0.2)] disabled:opacity-50 disabled:pointer-events-none disabled:hover:shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Successiva
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}
