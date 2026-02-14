"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";

interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  probability: number;
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
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SortType = "popular" | "expiring" | "recent" | "discussed";
type StatusType = "open" | "closed" | "all";

const SORT_OPTIONS: { id: SortType; label: string }[] = [
  { id: "popular", label: "In tendenza" },
  { id: "expiring", label: "In scadenza" },
  { id: "recent", label: "Più recenti" },
  { id: "discussed", label: "Più discussi" },
];

const STATUS_OPTIONS: { id: StatusType; label: string }[] = [
  { id: "open", label: "Aperti" },
  { id: "closed", label: "Chiusi" },
  { id: "all", label: "Tutti" },
];

export default function DiscoverPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [status, setStatus] = useState<StatusType>("open");
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
  }, [status, sort, page, search, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2 tracking-tight">
          Scopri le previsioni
        </h1>
        <p className="text-fg-muted text-sm md:text-base mb-6">
          Cerca, filtra e ordina gli eventi.
        </p>

        <form onSubmit={handleSearch} className="mb-6" role="search">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca eventi..."
              className="flex-1 w-full min-h-[48px] px-4 py-3 rounded-2xl border border-border dark:border-white/10 bg-surface/50 backdrop-blur-xl text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary text-base"
              aria-label="Cerca eventi"
            />
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover transition-colors shadow-glow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Cerca
            </button>
          </div>
        </form>

        <div className="mb-6 space-y-4">
          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Stato</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setStatus(opt.id);
                    setPage(1);
                  }}
                  className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    status === opt.id
                      ? "bg-primary text-white shadow-glow"
                      : "glass text-fg-muted border border-border dark:border-white/10 hover:border-primary/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Ordina per</p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSort(opt.id);
                    setPage(1);
                  }}
                  className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    sort === opt.id
                      ? "bg-primary text-white shadow-glow"
                      : "glass text-fg-muted border border-border dark:border-white/10 hover:border-primary/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">Categoria</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("");
                    setPage(1);
                  }}
                  className={`shrink-0 min-h-[40px] px-4 py-2 rounded-2xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                    selectedCategory === ""
                      ? "bg-primary text-white"
                      : "glass text-fg-muted border border-border dark:border-white/10 hover:border-primary/20"
                  }`}
                >
                  Tutte
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setPage(1);
                    }}
                    className={`shrink-0 min-h-[40px] px-4 py-2 rounded-2xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                      selectedCategory === cat
                        ? "bg-primary text-white"
                        : "glass text-fg-muted border border-border dark:border-white/10 hover:border-primary/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-center py-12 glass rounded-3xl border border-border dark:border-white/10 max-w-md mx-auto px-6">
            <p className="text-fg-muted mb-4">{error}</p>
            <button
              type="button"
              onClick={() => fetchEvents()}
              className="min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              Riprova
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
            <p className="mt-4 text-fg-muted font-medium">Caricamento...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 md:py-16 glass rounded-3xl border border-border dark:border-white/10 max-w-lg mx-auto px-6">
            <p className="text-fg-muted text-base md:text-lg">
              Nessun evento con questi filtri.
            </p>
            <p className="text-sm text-fg-subtle mt-2">
              Prova a cambiare categoria, stato o ordinamento.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
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
                  className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold glass border border-border dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Precedente
                </button>
                <span className="min-h-[44px] px-4 flex items-center text-fg-muted text-sm font-medium">
                  Pagina {page} di {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="min-h-[44px] px-4 py-2 rounded-2xl font-semibold glass border border-border dark:border-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
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
