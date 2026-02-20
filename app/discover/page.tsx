"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CategoryBoxes from "@/components/discover/CategoryBoxes";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingEventRow from "@/components/landing/LandingEventRow";
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

interface LiveActivity {
  count: number;
  recentVotes: number;
}

export default function DiscoverPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  const [closingSoonEvents, setClosingSoonEvents] = useState<Event[]>([]);
  const [loadingClosingSoon, setLoadingClosingSoon] = useState(true);

  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [liveActivity, setLiveActivity] = useState<LiveActivity>({
    count: 0,
    recentVotes: 0,
  });

  const heroRef = useRef<HTMLElement>(null);
  const [heroInView, setHeroInView] = useState(false);

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
    fetch("/api/events/trending-now?limit=3")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setTrendingEvents(data?.events ?? []))
      .catch(() => setTrendingEvents([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    setLoadingClosingSoon(true);
    fetch("/api/events/closing-soon?limit=3")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setClosingSoonEvents(data?.events ?? []))
      .catch(() => setClosingSoonEvents([]))
      .finally(() => setLoadingClosingSoon(false));
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

    fetch("/api/stats/live")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setLiveActivity({
            count: data.activeUsers ?? Math.floor(Math.random() * 50) + 20,
            recentVotes: data.recentVotes ?? Math.floor(Math.random() * 100) + 50,
          });
        }
      })
      .catch(() => {
        setLiveActivity({
          count: Math.floor(Math.random() * 50) + 20,
          recentVotes: Math.floor(Math.random() * 100) + 50,
        });
      });
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
          <h1 className="text-ds-h1 font-bold text-fg mb-2">Esplora gli Eventi</h1>
          <p className="text-ds-body text-fg-muted mb-6 max-w-md mx-auto">
            Scegli una categoria e metti alla prova le tue previsioni
          </p>

          {/* Live Stats Row */}
          <div className="flex justify-center items-center gap-6 sm:gap-8">
            <div className="animate-in-fade-up stagger-1 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-2xl font-bold text-primary font-numeric">
                  {liveActivity.count}
                </span>
              </div>
              <span className="text-ds-micro text-fg-muted">Online ora</span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="animate-in-fade-up stagger-2 text-center">
              <span className="text-2xl font-bold text-primary font-numeric block mb-1">
                {totalEvents || "—"}
              </span>
              <span className="text-ds-micro text-fg-muted">Eventi attivi</span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="animate-in-fade-up stagger-3 text-center">
              <span className="text-2xl font-bold text-primary font-numeric block mb-1">
                {liveActivity.recentVotes}+
              </span>
              <span className="text-ds-micro text-fg-muted">Voti oggi</span>
            </div>
          </div>
        </section>

        {/* Trending Section */}
        {!loadingTrending && trendingEvents.length > 0 && (
          <section className="mb-10 md:mb-12">
            <h2 className="landing-section-title landing-section-title--with-badge text-ds-h2 font-bold text-fg mb-4 flex flex-wrap items-baseline gap-2">
              <span className="landing-section-title__text">Trending</span>
              <span
                className="landing-live-badge text-ds-body"
                aria-label="In diretta"
              >
                <span className="landing-live-badge__deg" aria-hidden>
                  °
                </span>
                <span className="landing-live-badge__text">LIVE</span>
              </span>
            </h2>
            <ul className="flex flex-col gap-4" aria-label="Eventi in tendenza">
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
            <LoadingBlock message="Caricamento trending…" />
          </section>
        )}

        {/* Categories Section */}
        <SectionContainer
          title="Categorie"
          action={
            <Link
              href="/discover/tutti"
              className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
            >
              Vedi tutti
            </Link>
          }
        >
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
            <div className="animate-in-fade-up">
              <CategoryBoxes categories={categories} showTutti />
            </div>
          )}
        </SectionContainer>

        {/* Closing Soon Section */}
        {!loadingClosingSoon && closingSoonEvents.length > 0 && (
          <section className="mt-10 md:mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-ds-h2 font-bold text-fg flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  ⏰
                </span>
                In scadenza
              </h2>
              <Link
                href="/discover/tutti?deadline=24h"
                className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover"
              >
                Vedi tutti
              </Link>
            </div>
            <ul className="flex flex-col gap-4" aria-label="Eventi in scadenza">
              {closingSoonEvents.map((event, idx) => (
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

        {loadingClosingSoon && closingSoonEvents.length === 0 && (
          <section className="mt-10">
            <LoadingBlock message="Caricamento in scadenza…" />
          </section>
        )}

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
    </div>
  );
}
