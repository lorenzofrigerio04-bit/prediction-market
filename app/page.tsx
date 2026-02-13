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

  // Sincronizza la sessione con il server una sola volta quando si apre la homepage (autenticati).
  // Evita loop: usiamo un ref così l'effect non dipende da updateSession che può cambiare a ogni render.
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

  // Tutorial solo: utente loggato, nuovo (onboarding non completato), solo in homepage, una sola volta (DB + sessionStorage)
  const alreadyCompletedThisSession =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  const showOnboarding =
    pathname === "/" &&
    status === "authenticated" &&
    sessionSynced &&
    !!session?.user &&
    session.user.onboardingCompleted === false &&
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

  // Categorie e resolve eventi chiusi: una sola volta al mount.
  useEffect(() => {
    fetchCategories();
    resolveClosedEvents().catch(() => {});
  }, [fetchCategories]);

  // Eventi: rifetch quando cambiano filtro, ricerca o categoria.
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
    <div className="min-h-screen bg-gray-50">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight">
            Prediction Market
          </h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Scommetti sugli eventi, accumula crediti e sali in classifica.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8" role="search">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cerca eventi per titolo o categoria..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow placeholder:text-gray-400"
              aria-label="Cerca eventi"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Cerca
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-600">Filtri:</span>
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                  filter === btn.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">
                Categoria:
              </span>
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                  selectedCategory === ""
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Tutte
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Events List */}
        {eventsError ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-md mx-auto">
            <p className="text-gray-600 mb-6">{eventsError}</p>
            <button
              onClick={() => fetchEvents()}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
              Riprova
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-hidden />
            <p className="mt-4 text-gray-600 font-medium">Caricamento eventi...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-lg mx-auto">
            <p className="text-gray-600 text-lg mb-2">
              {search
                ? "Nessun evento trovato per la tua ricerca."
                : "Nessun evento disponibile al momento."}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {search ? "Prova con altre parole chiave." : "Torna più tardi per nuovi eventi."}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                }}
                className="text-blue-600 hover:text-blue-700 font-medium focus-visible:underline"
              >
                Rimuovi filtro di ricerca
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
