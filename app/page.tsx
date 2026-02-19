"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import OnboardingTour from "@/components/OnboardingTour";
import LandingEventRow from "@/components/landing/LandingEventRow";
import LandingBackground from "@/components/landing/LandingBackground";
import LandingHeroStats from "@/components/landing/LandingHeroStats";
import LandingHeroTitle from "@/components/landing/LandingHeroTitle";
import HomeSummary from "@/components/home/HomeSummary";
import {
  PageHeader,
  SectionContainer,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";
import { getDisplayTitle, isDebugTitle } from "@/lib/debug-display";
import type { EventFomoStats } from "@/lib/fomo/event-stats";
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

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
  /** Statistiche FOMO */
  fomo?: EventFomoStats;
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

interface Mission {
  id: string;
  name: string;
  description: string | null;
  type: string;
  target: number;
  reward: number;
  progress: number;
  completed: boolean;
}

export default function Home() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Debug panel and [DEBUG] titles only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true.
  const debugMode =
    searchParams.get("debug") === "1" ||
    (typeof process.env.NEXT_PUBLIC_DEBUG_MODE !== "undefined" &&
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true");
  const { data: session, status, update: updateSession } = useSession();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [sessionSynced, setSessionSynced] = useState(false);
  const sessionSyncDone = useRef(false);

  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [weeklyRank, setWeeklyRank] = useState<number | undefined>(undefined);
  const [rankLoading, setRankLoading] = useState(true);
  const [streak, setStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [eventsTrending, setEventsTrending] = useState<Event[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [eventsClosingSoon, setEventsClosingSoon] = useState<Event[]>([]);
  const [loadingClosingSoon, setLoadingClosingSoon] = useState(true);
  const [eventsTrendingNow, setEventsTrendingNow] = useState<Event[]>([]);
  const [loadingTrendingNow, setLoadingTrendingNow] = useState(true);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [canSpinToday, setCanSpinToday] = useState<boolean | null>(null);
  const [spinLoading, setSpinLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ version?: { commit: string; env: string; baseUrl: string }; health?: { dbConnected: boolean; markets_count: number } } | null>(null);

  useEffect(() => {
    if (!debugMode) return;
    Promise.all([fetch("/api/version").then((r) => r.ok ? r.json() : null), fetch("/api/health").then((r) => r.ok ? r.json() : null)])
      .then(([version, health]) => setDebugInfo({ version: version ?? undefined, health: health ?? undefined }))
      .catch(() => setDebugInfo(null));
  }, [debugMode]);

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

  useEffect(() => {
    if (status !== "authenticated") return;
    setCreditsLoading(true);
    fetch("/api/user/credits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data != null && typeof data.credits === "number" && setCredits(data.credits))
      .catch(() => {})
      .finally(() => setCreditsLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setRankLoading(true);
    fetch("/api/leaderboard?period=weekly")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.myRank != null && setWeeklyRank(data.myRank))
      .catch(() => {})
      .finally(() => setRankLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setStreakLoading(true);
    fetch("/api/profile/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.stats?.streak != null && setStreak(data.stats.streak))
      .catch(() => {})
      .finally(() => setStreakLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingTrending(true);
    setEventsError(null);
    const fallbackToEvents = () =>
      fetch("/api/events?sort=recent&status=open&limit=8")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setEventsTrending(data?.events ?? []));
    // Feed personalizzato (trending + per te + esplorazione); fallback a lista eventi se fallisce o vuoto
    fetch("/api/feed?limit=8")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        const items = data?.items ?? [];
        if (items.length > 0) {
          setEventsTrending(items);
        } else {
          fallbackToEvents();
        }
      })
      .catch(() => fallbackToEvents())
      .catch(() => {
        setEventsError("Impossibile caricare gli eventi.");
        setEventsTrending([]);
      })
      .finally(() => setLoadingTrending(false));
  }, [status]);

  // Fetch eventi in scadenza (< 6h)
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingClosingSoon(true);
    fetch("/api/events/closing-soon?limit=6")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setEventsClosingSoon(data?.events ?? []))
      .catch(() => setEventsClosingSoon([]))
      .finally(() => setLoadingClosingSoon(false));
  }, [status]);

  // Fetch eventi trending (votesVelocity desc)
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingTrendingNow(true);
    fetch("/api/events/trending-now?limit=6")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setEventsTrendingNow(data?.events ?? []))
      .catch(() => setEventsTrendingNow([]))
      .finally(() => setLoadingTrendingNow(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setMissionsLoading(true);
    fetch("/api/missions")
      .then((r) => r.ok && r.json())
      .then((data) => setMissions((data?.daily ?? []).slice(0, 3)))
      .catch(() => setMissions([]))
      .finally(() => setMissionsLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setSpinLoading(true);
    fetch("/api/spin/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data?.canSpin != null ? setCanSpinToday(data.canSpin) : setCanSpinToday(null)))
      .catch(() => setCanSpinToday(null))
      .finally(() => setSpinLoading(false));
  }, [status]);

  // Genera notifiche on-demand quando utente apre Home (best-effort)
  useEffect(() => {
    if (status === "authenticated") {
      generateNotificationsOnDemand();
    }
  }, [status]);

  const showLanding = status === "unauthenticated";
  const [landingEvents, setLandingEvents] = useState<Event[]>([]);
  const [landingEventsLoading, setLandingEventsLoading] = useState(false);
  const fetchLandingEvents = useCallback(async () => {
    if (!showLanding) return;
    setLandingEventsLoading(true);
    try {
      const res = await fetch("/api/events?sort=recent&limit=5&status=open");
      if (res.ok) {
        const data: EventsResponse = await res.json();
        setLandingEvents(data.events ?? []);
      }
    } catch {
      setLandingEvents([]);
    } finally {
      setLandingEventsLoading(false);
    }
  }, [showLanding]);
  useEffect(() => {
    if (showLanding) fetchLandingEvents();
  }, [showLanding, fetchLandingEvents]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingBlock message="" />
        </div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <div className="min-h-screen relative overflow-x-hidden landing-page">
        <LandingBackground />
        <Header />
        <main id="main-content" className="relative mx-auto px-4 sm:px-6 py-5 md:py-12 lg:py-16 max-w-2xl">
          {/* Hero: corpo più in alto, respiro tra contatori e barra inferiore; linee LED incubano titolo e CTA */}
          <section className="landing-hero-section min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-4.5rem)] flex flex-col justify-center pt-2 pb-24 md:pt-4 md:pb-28">
            <div className="landing-hero-card px-4 py-0 md:px-10 md:py-0 text-center flex flex-col justify-center">
              <p className="landing-hero-eyebrow text-[0.7rem] sm:text-ds-caption font-semibold uppercase tracking-wider mb-1.5 md:mb-2 text-white/95 text-center max-w-full break-words leading-snug -mt-[0.5cm]">
                Mercati di previsione – Solo crediti virtuali
              </p>
              <div className="landing-hero-line my-2 md:my-3" aria-hidden />
              <LandingHeroTitle />
              <div className="landing-hero-line landing-hero-line--below my-3 md:my-4" aria-hidden />
              <p className="landing-hero-subtitle text-ds-body-landing font-normal text-white/90 max-w-md mx-auto leading-snug text-center">
                Se pensi di saperlo prima degli altri,
                <br />
                <span className="landing-hero-subtitle-emphasis">è il momento di provarlo.</span>
              </p>
              <div className="landing-hero-line landing-hero-line--cta my-5 md:my-6" aria-hidden />
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5 md:mb-6">
                <Link
                  href="/auth/signup"
                  className="landing-cta-primary w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-xl font-semibold text-ds-body inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  Prevedi ora — 1000 crediti di benvenuto!
                </Link>
                <Link
                  href="/auth/login"
                  className="landing-cta-secondary w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  Già account? Accedi
                </Link>
              </div>
              <LandingHeroStats />
            </div>
          </section>

          <section className="mb-12 md:mb-16 pt-2">
            <h2 className="landing-section-title landing-section-title--with-badge text-ds-h2 font-bold text-fg mb-6 flex flex-wrap items-center gap-2">
              <span className="landing-section-title__text">Eventi in corso</span>
              <span className="landing-live-badge" aria-label="In diretta">
                <span className="landing-live-badge__deg" aria-hidden>°</span>
                <span className="landing-live-badge__text">LIVE</span>
              </span>
            </h2>
            {landingEventsLoading ? (
              <LoadingBlock message="Caricamento…" />
            ) : landingEvents.length === 0 ? (
              <EmptyState
                title="Nessun evento aperto per ora."
                description="Torna più tardi o esplora le categorie."
                action={{ label: "Esplora categorie", href: "/discover" }}
              />
            ) : (
              <ul className="flex flex-col gap-4" aria-label="Anteprima eventi">
                {(debugMode ? landingEvents : landingEvents.filter((e) => !isDebugTitle(e.title))).map((event) => (
                  <li key={event.id}>
                    <LandingEventRow
                      event={{
                        id: event.id,
                        title: getDisplayTitle(event.title, debugMode),
                        category: event.category,
                        closesAt: event.closesAt,
                        probability: event.probability,
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mb-12 md:mb-16">
            <h2 className="landing-section-title text-ds-h2 font-bold text-fg mb-6 text-center">
              Perché giocare
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
              <div className="box-raised p-5 md:p-6 text-center hover-lift transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-2xl mb-3" aria-hidden>🏆</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Classifiche settimanali</h3>
                <p className="text-ds-body-sm text-fg-muted">Sali in classifica ogni settimana e confrontati con la community.</p>
              </div>
              <div className="box-raised p-5 md:p-6 text-center hover-lift transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-2xl mb-3" aria-hidden>🎯</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Missioni & streak</h3>
                <p className="text-ds-body-sm text-fg-muted">Completa missioni e mantieni lo streak per crediti extra.</p>
              </div>
              <div className="box-raised p-5 md:p-6 text-center hover-lift transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-2xl mb-3" aria-hidden>📋</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Regole trasparenti</h3>
                <p className="text-ds-body-sm text-fg-muted">Ogni evento ha criteri di risoluzione chiari e verificabili.</p>
              </div>
            </div>
          </section>

          <section className="text-center pt-6 pb-10">
            <div className="landing-hero-card inline-block px-8 py-6 md:px-10 md:py-8">
              <p className="text-ds-body font-semibold text-fg mb-3">Pronto a iniziare?</p>
              <Link
                href="/auth/signup"
                className="landing-cta-primary w-full max-w-sm mx-auto min-h-[48px] px-6 py-4 rounded-xl font-semibold text-ds-body-sm text-white inline-flex items-center justify-center transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Prevedi ora — 100 crediti gratis
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const displayName = session?.user?.name || session?.user?.email || "utente";

  const refetchTrending = () => {
    setLoadingTrending(true);
    setEventsError(null);
    const fallbackToEvents = () =>
      fetch("/api/events?sort=recent&status=open&limit=8")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setEventsTrending(data?.events ?? []));
    fetch("/api/feed?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const items = data?.items ?? [];
        if (items.length > 0) setEventsTrending(items);
        else fallbackToEvents();
      })
      .catch(() => fallbackToEvents())
      .catch(() => {
        setEventsError("Impossibile caricare gli eventi.");
        setEventsTrending([]);
      })
      .finally(() => setLoadingTrending(false));
  };

  return (
    <div className="min-h-screen bg-bg">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-6xl">
        <PageHeader
          title={`Bentornato, ${displayName}.`}
          description="Ecco cosa succede oggi."
        />
        {/* Debug panel: only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true. */}
        {debugMode && (
          <div className="text-ds-micro text-fg-muted mb-2 p-2 rounded bg-white/5" aria-hidden>
            <p>debug: commit={debugInfo?.version?.commit ?? "—"} env={debugInfo?.version?.env ?? "—"} baseUrl={debugInfo?.version?.baseUrl ? `${debugInfo.version.baseUrl.slice(0, 40)}…` : "—"}</p>
            <p>dbConnected={String(debugInfo?.health?.dbConnected ?? "—")} markets_count={debugInfo?.health?.markets_count ?? eventsTrending.length} (UI: {eventsTrending.length}) endpoint: {status === "authenticated" ? "/api/feed → fallback /api/events" : "/api/events"}</p>
          </div>
        )}

        <HomeSummary
          credits={credits}
          weeklyRank={weeklyRank}
          streak={streak}
          creditsLoading={creditsLoading}
          rankLoading={rankLoading}
          streakLoading={streakLoading}
        />

        <section
          className="mb-section md:mb-section-lg"
          aria-label="Spin of the Day"
        >
          <Link
            href="/spin"
            className="block card-raised hover-lift p-4 md:p-5 transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
                🎡 Spin of the Day
              </h2>
              <span className="text-ds-micro font-semibold text-primary">
                Gira →
              </span>
            </div>
            {spinLoading ? (
              <p className="text-ds-body-sm text-fg-muted animate-pulse">Caricamento...</p>
            ) : canSpinToday ? (
              <p className="text-ds-body-sm text-fg">
                Un giro al giorno. Vinci fino a <strong className="text-primary">500 crediti</strong>.
              </p>
            ) : (
              <p className="text-ds-body-sm text-fg-muted">
                Spin di oggi usato. Torna domani.
              </p>
            )}
          </Link>
        </section>

        <section
          className="mb-section md:mb-section-lg"
          aria-label="Missioni"
        >
          <Link
            href="/missions"
            className="block card-raised hover-lift p-4 md:p-5 transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="text-ds-body font-bold text-fg group-hover:text-primary transition-colors">
                Missioni
              </h2>
              <span className="text-ds-micro font-semibold text-primary">
                Vedi tutte →
              </span>
            </div>
            {missionsLoading ? (
              <p className="text-ds-body-sm text-fg-muted animate-pulse">Caricamento...</p>
            ) : missions.length === 0 ? (
              <p className="text-ds-body-sm text-fg-muted">
                Completa le missioni per guadagnare crediti.
              </p>
            ) : (
              <ul className="space-y-2">
                {missions.slice(0, 3).map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between gap-2 text-ds-body-sm"
                  >
                    <span className="text-fg truncate">{m.name}</span>
                    <span className="shrink-0 font-semibold text-primary">
                      {m.completed ? "✓" : `${m.progress}/${m.target}`} · +{m.reward} cr
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Link>
        </section>

        {/* Sezione: In scadenza (< 6h) */}
        {eventsClosingSoon.length > 0 && (
          <SectionContainer
            title="In scadenza"
            action={
              <Link
                href="/discover?status=open&deadline=24h"
                className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
              >
                Vedi tutti
              </Link>
            }
          >
            {loadingClosingSoon ? (
              <LoadingBlock message="Caricamento…" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {(debugMode ? eventsClosingSoon : eventsClosingSoon.filter((e) => !isDebugTitle(e.title))).map((event) => (
                  <EventCard
                    key={event.id}
                    event={{ ...event, title: getDisplayTitle(event.title, debugMode) }}
                  />
                ))}
              </div>
            )}
          </SectionContainer>
        )}

        {/* Sezione: In tendenza (votesVelocity desc) */}
        <SectionContainer
          title="In tendenza"
          action={
            <Link
              href="/discover?sort=popular"
              className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
            >
              Vedi tutti gli eventi
            </Link>
          }
        >
          {loadingTrendingNow ? (
            <LoadingBlock message="Caricamento…" />
          ) : eventsTrendingNow.length === 0 ? (
            <EmptyState
              title="Nessun evento in tendenza"
              description={
                <>
                  <p className="mb-2">Non ci sono ancora eventi attivi. Completa le missioni per guadagnare crediti e torna quando apriranno nuovi mercati.</p>
                </>
              }
              action={{ label: "Vai alle missioni", href: "/missions" }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {(debugMode ? eventsTrendingNow : eventsTrendingNow.filter((e) => !isDebugTitle(e.title))).map((event) => (
                <EventCard
                  key={event.id}
                  event={{ ...event, title: getDisplayTitle(event.title, debugMode) }}
                />
              ))}
            </div>
          )}
        </SectionContainer>
      </main>
    </div>
  );
}
