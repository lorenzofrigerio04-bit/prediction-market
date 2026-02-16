"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import OnboardingTour from "@/components/OnboardingTour";
import LandingEventRow from "@/components/landing/LandingEventRow";
import HomeSummary from "@/components/home/HomeSummary";
import {
  PageHeader,
  SectionContainer,
  EmptyState,
  LoadingBlock,
} from "@/components/ui";

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
  const debugMode = searchParams.get("debug") === "1";
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

  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [canSpinToday, setCanSpinToday] = useState<boolean | null>(null);
  const [spinLoading, setSpinLoading] = useState(false);

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
      <div className="min-h-screen bg-bg relative overflow-x-hidden">
        <div className="landing-bg" aria-hidden />
        <Header />
        <main className="relative mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-16 max-w-2xl">
          <section className="mb-12 md:mb-16">
            <div className="landing-hero-card px-6 py-8 md:px-10 md:py-12 text-center">
              <p className="text-ds-caption font-semibold uppercase tracking-wider text-primary mb-4 md:mb-5">
                Mercati di previsione · Solo crediti virtuali
              </p>
              <h1 className="landing-hero-title text-ds-display font-bold mb-3 md:mb-4 max-w-2xl mx-auto leading-tight tracking-headline">
                Prevedi il futuro. Guadagna crediti. Scala la classifica.
              </h1>
              <p className="text-ds-body md:text-lg text-fg-muted max-w-xl mx-auto mb-8 md:mb-10 leading-snug">
                Partecipa ai mercati sociali su eventi reali. Più sei preciso, più sali. Zero rischio, zero soldi veri.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
                <Link
                  href="/auth/signup"
                  className="landing-cta-primary w-full sm:w-auto min-h-[52px] px-8 py-4 rounded-2xl font-semibold text-ds-body inline-flex items-center justify-center transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  Inizia ora — 100 crediti gratis
                </Link>
                <Link
                  href="/auth/login"
                  className="w-full sm:w-auto min-h-[52px] px-6 py-4 rounded-2xl font-semibold text-ds-body border-2 border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/70 hover:shadow-[0_0_24px_-8px_rgba(var(--primary-glow),0.3)] transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg inline-flex items-center justify-center"
                >
                  Accedi
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-ds-micro font-semibold bg-primary/15 dark:bg-black/50 border border-primary/40 text-fg dark:text-white/95 shadow-[0_0_14px_-4px_rgba(var(--primary-glow),0.3)]">
                  ⚡ Eventi in tempo reale
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-ds-micro font-semibold bg-primary/15 dark:bg-black/50 border border-primary/40 text-fg dark:text-white/95 shadow-[0_0_14px_-4px_rgba(var(--primary-glow),0.3)]">
                  🏆 Classifiche settimanali
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-ds-micro font-semibold bg-primary/15 dark:bg-black/50 border border-primary/40 text-fg dark:text-white/95 shadow-[0_0_14px_-4px_rgba(var(--primary-glow),0.3)]">
                  🛡️ Nessun rischio reale
                </span>
              </div>
            </div>
          </section>

          <section className="mb-12 md:mb-16">
            <h2 className="landing-section-title text-ds-h2 font-bold text-fg mb-6">
              Eventi in corso
            </h2>
            {landingEventsLoading ? (
              <LoadingBlock message="Caricamento eventi..." />
            ) : landingEvents.length === 0 ? (
              <EmptyState
                title="Nessun evento attivo ora"
                description="Registrati e ricevi 100 crediti gratis. Quando apriranno nuovi eventi sarai pronto."
                action={{ label: "Inizia ora — 100 crediti gratis", href: "/auth/signup" }}
              />
            ) : (
              <ul className="flex flex-col gap-4" aria-label="Anteprima eventi">
                {landingEvents.map((event) => (
                  <li key={event.id}>
                    <LandingEventRow
                      event={{
                        id: event.id,
                        title: event.title,
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
              <div className="box-neon-soft p-5 md:p-6 text-center hover:shadow-[0_0_28px_-8px_rgba(var(--primary-glow),0.22)] transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-2xl mb-3" aria-hidden>🏆</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Classifiche settimanali</h3>
                <p className="text-ds-body-sm text-fg-muted">Sali in classifica ogni settimana e confrontati con la community.</p>
              </div>
              <div className="box-neon-soft p-5 md:p-6 text-center hover:shadow-[0_0_28px_-8px_rgba(var(--primary-glow),0.22)] transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 text-2xl mb-3" aria-hidden>🎯</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Missioni & streak</h3>
                <p className="text-ds-body-sm text-fg-muted">Completa missioni e mantieni lo streak per crediti extra.</p>
              </div>
              <div className="box-neon-soft p-5 md:p-6 text-center hover:shadow-[0_0_28px_-8px_rgba(var(--primary-glow),0.22)] transition-shadow">
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
                className="landing-cta-primary w-full max-w-sm mx-auto min-h-[52px] px-6 py-4 rounded-2xl font-semibold text-ds-body text-white inline-flex items-center justify-center transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Inizia ora — 100 crediti gratis
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
      <main className="mx-auto px-page-x py-page-y md:py-8 max-w-6xl">
        <PageHeader
          title={`Bentornato, ${displayName}.`}
          description="Ecco cosa succede oggi."
        />
        {debugMode && (
          <p className="text-ds-micro text-fg-muted mb-2" aria-hidden>
            debug: version=footer / markets_count={eventsTrending.length} / feed_used
          </p>
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
            className="block card-neon-glass p-4 md:p-5 hover:shadow-[0_0_32px_-8px_rgba(var(--primary-glow),0.25)] transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
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
            className="block card-neon-glass p-4 md:p-5 hover:shadow-[0_0_32px_-8px_rgba(var(--primary-glow),0.25)] transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
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

        <SectionContainer
          title="Eventi in tendenza"
          action={
            <Link
              href="/discover"
              className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
            >
              Vedi tutti gli eventi
            </Link>
          }
        >
          {eventsError ? (
            <EmptyState
              description={eventsError}
              action={{ label: "Riprova", onClick: refetchTrending }}
            />
          ) : loadingTrending ? (
            <LoadingBlock message="Caricamento eventi..." />
          ) : eventsTrending.length === 0 ? (
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
              {eventsTrending.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </SectionContainer>
      </main>
    </div>
  );
}
