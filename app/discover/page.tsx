"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CategoryBoxes from "@/components/discover/CategoryBoxes";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingEventRow from "@/components/landing/LandingEventRow";
import CreateEventModal from "@/components/discover/CreateEventModal";
import { SectionContainer, EmptyState, LoadingBlock } from "@/components/ui";

interface Event {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
  _count?: { predictions: number };
}

export default function DiscoverPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const [heroInView, setHeroInView] = useState(false);

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setHeroInView(true);
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        setCategories([]);
      }
    } catch {
      setError("Impossibile caricare le categorie.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setLoadingTrending(true);
    fetch("/api/events/viral-by-category")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTrendingEvents(data?.events ?? []))
      .catch(() => setTrendingEvents([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    fetch("/api/events?status=open&limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.pagination?.total) {
          setTotalEvents(data.pagination.total);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden discover-page">
      <LandingBackground />
      <Header />

      <main
        id="main-content"
        className="relative mx-auto px-4 sm:px-6 py-5 md:py-8 max-w-2xl"
      >
        {/* Hero Section */}
        <section
          ref={heroRef}
          className={`text-center mb-8 md:mb-10 transition-all duration-700 ${
            heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-ds-h1 font-bold text-white mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            Esplora gli Eventi
          </h1>

          {/* LED Line under title */}
          <div className="discover-hero-line mx-auto mb-6" aria-hidden />

          {/* Stats Row - Landing style */}
          <div className="flex justify-center items-stretch gap-4 sm:gap-6">
            <button
              onClick={scrollToCategories}
              className="animate-in-fade-up stagger-1 flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform min-w-[70px]"
            >
              <span className="discover-stat-value">
                {categories.length || 7}
              </span>
              <span className="discover-stat-label mt-1">Categorie</span>
            </button>

            <div className="discover-divider-led self-center" aria-hidden />

            <div className="animate-in-fade-up stagger-2 flex flex-col items-center justify-between min-w-[70px]">
              <span className="discover-stat-value">
                {totalEvents || "—"}
              </span>
              <span className="discover-stat-label mt-1">Eventi attivi</span>
            </div>

            <div className="discover-divider-led self-center" aria-hidden />

            <button
              onClick={() => setShowCreateModal(true)}
              className="animate-in-fade-up stagger-3 flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-transform min-w-[70px]"
            >
              <span className="discover-stat-value">
                +
              </span>
              <span className="discover-stat-label mt-1">Crea evento</span>
            </button>
          </div>
        </section>

        {/* Eventi Virali Section */}
        {!loadingTrending && trendingEvents.length > 0 && (
          <section className="mb-10 md:mb-12">
            <h2 className="discover-viral-title text-ds-h2 font-bold text-white mb-4">
              Eventi virali
            </h2>
            <ul className="flex flex-col gap-4" aria-label="Eventi virali">
              {trendingEvents.map((event, idx) => (
                <li
                  key={event.id}
                  className={`animate-in-fade-up stagger-${Math.min(idx + 1, 6)}`}
                >
                  <LandingEventRow event={event} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {loadingTrending && (
          <section className="mb-10 md:mb-12">
            <LoadingBlock message="Caricamento eventi virali…" />
          </section>
        )}

        {/* Categories Section */}
        <section ref={categoriesRef} className="scroll-mt-20">
          {/* Semi-title */}
          <h2 className="discover-semititle text-center mb-6">
            Scegli una categoria e metti alla prova le tue previsioni
          </h2>

          {error ? (
            <EmptyState
              title="Errore"
              description={error}
              action={{ label: "Riprova", onClick: () => fetchCategories() }}
            />
          ) : loading ? (
            <div className="py-8">
              <LoadingBlock message="Caricamento…" />
            </div>
          ) : (
            <CategoryBoxes categories={categories} showTutti />
          )}
        </section>

        {/* CTA Section */}
        <section className="text-center pt-10 pb-8">
          <div className="landing-hero-card inline-block px-6 py-5 sm:px-8 sm:py-6 rounded-2xl">
            <p className="text-ds-body font-semibold text-white mb-3">
              Non sai da dove iniziare?
            </p>
            <Link
              href="/discover/tutti"
              className="landing-cta-primary w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Esplora tutti gli eventi →
            </Link>
          </div>
        </section>
      </main>

      {/* Create Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
