"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import OnboardingTour from "@/components/OnboardingTour";
import { resolveClosedEvents } from "@/lib/resolveClosedEvents";

const ONBOARDING_STORAGE_KEY = "prediction-market-onboarding-completed";

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

type FilterType = "all" | "expiring" | "popular";

export default function Home() {
  const pathname = usePathname();
  const { data: session, status, update: updateSession } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [sessionSynced, setSessionSynced] = useState(false);
  const sessionSyncDone = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated" || status === "loading") {
      setSessionSynced(true);
      return;
    }
    if (status === "authenticated" && !sessionSyncDone.current) {
      sessionSyncDone.current = true;
      updateSession()
        .then(() => setSessionSynced(true))
        .catch(() => setSessionSynced(true));
    }
  }, [status]);

  const alreadyCompletedThisSession =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  const showOnboarding =
    pathname === "/" &&
    status === "authenticated" &&
    sessionSynced &&
    !!session?.user &&
    session.user?.onboardingCompleted === false &&
    !alreadyCompletedThisSession &&
    !onboardingDismissed;

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    }
    (async () => {
      try {
        const res = await fetch("/api/user/onboarding-complete", { method: "POST" });
        if (res.ok) await updateSession();
      } catch {
        updateSession().catch(() => {});
      }
    })();
  }, [updateSession]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setEventsError(null);
    try {
      const params = new URLSearchParams({
        filter,
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(`/api/events?${params}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Failed to fetch events");
      const data: EventsResponse = await response.json();
      setEvents(data.events ?? []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventsError(
        error instanceof Error && error.name === "AbortError"
          ? "Tempo scaduto. Riprova."
          : "Impossibile caricare gli eventi."
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/events/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    resolveClosedEvents().catch(() => {});
  }, [fetchCategories]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const filterButtons = [
    { id: "all" as FilterType, label: "Tutti" },
    { id: "expiring" as FilterType, label: "In scadenza" },
    { id: "popular" as FilterType, label: "Popolari" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-6xl">
        {/* Hero - compatto su mobile */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 tracking-tight">
            Prediction Market
          </h1>
          <p className="text-slate-600 text-sm md:text-lg max-w-xl mx-auto">
            Scommetti sugli eventi, accumula crediti e sali in classifica.
          </p>
        </div>

        {/* Search - full width, touch-friendly */}
        <form onSubmit={handleSearch} className="mb-6 md:mb-8" role="search">
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca eventi..."
              className="flex-1 w-full min-h-[48px] px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-card focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-shadow placeholder:text-slate-400 text-base"
              aria-label="Cerca eventi"
            />
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 bg-accent-500 text-white font-semibold rounded-2xl hover:bg-accent-600 active:bg-accent-700 transition-colors shadow-card focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              Cerca
            </button>
          </div>
        </form>

        {/* Filtri - scroll orizzontale su mobile */}
        <div className="mb-6 md:mb-8">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Filtri</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1 md:flex-wrap md:overflow-visible">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 ${
                  filter === btn.id
                    ? "bg-accent-500 text-white shadow-glow"
                    : "bg-white text-slate-700 border border-slate-200 shadow-card hover:border-slate-300"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">Categoria</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1 md:flex-wrap md:overflow-visible">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`shrink-0 min-h-[40px] px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-accent-500 ${
                    selectedCategory === ""
                      ? "bg-accent-500 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Tutte
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 min-h-[40px] px-4 py-2 rounded-full text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-accent-500 ${
                      selectedCategory === cat
                        ? "bg-accent-500 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Eventi */}
        {eventsError ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-3xl border border-slate-200 shadow-card max-w-md mx-auto px-6">
            <p className="text-slate-600 mb-6">{eventsError}</p>
            <button
              onClick={() => fetchEvents()}
              className="min-h-[48px] px-6 py-3 bg-accent-500 text-white font-semibold rounded-2xl hover:bg-accent-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              Riprova
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-12 md:py-16">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" aria-hidden />
            <p className="mt-4 text-slate-600 font-medium">Caricamento eventi...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-3xl border border-slate-200 shadow-card max-w-lg mx-auto px-6">
            <p className="text-slate-600 text-base md:text-lg mb-2">
              {search
                ? "Nessun evento trovato per la tua ricerca."
                : "Nessun evento disponibile al momento."}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {search ? "Prova con altre parole chiave." : "Torna più tardi per nuovi eventi."}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="text-accent-600 hover:text-accent-700 font-semibold focus-visible:underline"
              >
                Rimuovi filtro
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
