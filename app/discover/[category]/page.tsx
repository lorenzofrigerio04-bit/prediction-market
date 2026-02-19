"use client";

import { useState, useEffect, useCallback, useDeferredValue } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import MarketCardSkeleton from "@/components/discover/MarketCardSkeleton";
import type { EventCardEvent } from "@/components/EventCard";
import {
  PageHeader,
  EmptyState,
  FilterChips,
} from "@/components/ui";
import { getDisplayTitle, isDebugTitle } from "@/lib/debug-display";
import { getCategoryNameFromSlug } from "@/lib/category-slug";

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
  fomo?: {
    countdownMs: number;
    participantsCount: number;
    votesVelocity: number;
    pointsMultiplier: number;
    isClosingSoon: boolean;
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

export default function DiscoverCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.category === "string" ? params.category : "";
  const [categories, setCategories] = useState<string[]>([]);
  const categoryName = slug === "tutti" ? null : getCategoryNameFromSlug(slug, categories);

  const [events, setEvents] = useState<DiscoverEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusType>("open");
  const [deadline, setDeadline] = useState<DeadlineType>("");
  const [sort, setSort] = useState<SortType>("recent");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<EventsResponse["pagination"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/events/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setCategories(data?.categories ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    if (slug === "tutti" || slug === "") return;
    if (getCategoryNameFromSlug(slug, categories) === null) {
      router.replace("/discover");
    }
  }, [slug, categories, router]);

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
        ...(categoryName && { category: categoryName }),
        ...(status === "open" && deadline && { deadline }),
      });
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data: EventsResponse = await res.json();
      setEvents(data.events ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error("Discover category fetch error:", err);
      setError("Impossibile caricare gli eventi.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [status, sort, page, search, categoryName, deadline]);

  useEffect(() => {
    setSearch(deferredSearch);
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    if (slug === "tutti" || categoryName !== undefined) {
      fetchEvents();
    }
  }, [fetchEvents, slug, categoryName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;
  const hasFilters = !!search || status !== "open" || !!deadline;
  const isEmptyCatalog = !loading && !error && events.length === 0;
  const pageTitle = categoryName ?? "Tutti gli eventi";
  const debugMode =
    typeof window !== "undefined" &&
    (new URLSearchParams(window.location.search).get("debug") === "1" ||
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true");

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main id="main-content" className="mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-6xl">
        <nav className="mb-4 text-ds-body-sm text-fg-muted" aria-label="Breadcrumb">
          <Link href="/discover" className="hover:text-primary transition-colors">
            Eventi
          </Link>
          <span className="mx-2">/</span>
          <span className="text-fg font-medium">{pageTitle}</span>
        </nav>

        <PageHeader
          title={pageTitle}
          description="Prevedi e scala la classifica."
        />

        <div className="mb-6 flex flex-col gap-4">
          <form onSubmit={handleSearch} className="w-full" role="search">
            <label htmlFor="discover-cat-search" className="sr-only">
              Cerca eventi
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-muted pointer-events-none" aria-hidden>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                id="discover-cat-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cerca in questa categoria..."
                className="w-full min-h-[48px] pl-12 pr-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm text-fg placeholder:text-fg-muted focus:ring-2 focus:ring-primary focus:border-primary text-ds-body ds-tap-target"
                aria-label="Cerca eventi"
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[36px] px-4 rounded-xl bg-primary text-white text-ds-body-sm font-semibold hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Cerca
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3">
            <FilterChips
              label="Stato"
              options={STATUS_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={status}
              onChange={(id) => {
                setStatus(id as StatusType);
                if (id !== "open") setDeadline("");
                setPage(1);
              }}
              className="shrink-0"
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
                className="shrink-0"
              />
            )}
            <FilterChips
              label="Ordina"
              options={SORT_OPTIONS.map((o) => ({ id: o.id, label: o.label }))}
              value={sort}
              onChange={(id) => {
                setSort(id as SortType);
                setPage(1);
              }}
              className="shrink-0"
            />
          </div>
        </div>

        {error ? (
          <EmptyState
            title="Qualcosa è andato storto. Riprova tra poco."
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
            title="Nessun evento aperto per ora."
            description="Torna più tardi o esplora le categorie."
            action={
              hasFilters
                ? {
                    label: "Azzera filtri",
                    onClick: () => {
                      setSearch("");
                      setSearchInput("");
                      setStatus("open");
                      setDeadline("");
                      setSort("recent");
                      setPage(1);
                    },
                  }
                : { label: "Esplora categorie", href: "/discover" }
            }
          />
        ) : (
          <>
            <p className="text-ds-body-sm text-fg-muted mb-4">
              {total} {total === 1 ? "evento" : "eventi"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {(debugMode ? events : events.filter((e) => !isDebugTitle(e.title))).map((event) => (
                <EventCard
                  key={event.id}
                  event={
                    {
                      id: event.id,
                      title: getDisplayTitle(event.title, debugMode),
                      description: event.description,
                      category: event.category,
                      closesAt: event.closesAt,
                      probability: event.probability,
                      totalCredits: event.totalCredits,
                      yesCredits: event.yesCredits,
                      noCredits: event.noCredits,
                      _count: event._count,
                      fomo: event.fomo,
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
                  className="min-h-[44px] px-4 rounded-xl font-semibold text-ds-body-sm border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 text-fg hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
                  className="min-h-[44px] px-4 rounded-xl font-semibold text-ds-body-sm border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 text-fg hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
