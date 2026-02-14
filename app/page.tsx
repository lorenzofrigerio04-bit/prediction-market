"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import OnboardingTour from "@/components/OnboardingTour";
import LandingEventRow from "@/components/landing/LandingEventRow";
import HomeSummary from "@/components/home/HomeSummary";
import { resolveClosedEvents } from "@/lib/resolveClosedEvents";
import {
  PageHeader,
  SectionContainer,
  CTAButton,
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
  const { data: session, status, update: updateSession } = useSession();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [sessionSynced, setSessionSynced] = useState(false);
  const sessionSyncDone = useRef(false);

  // Top summary
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [weeklyRank, setWeeklyRank] = useState<number | undefined>(undefined);
  const [rankLoading, setRankLoading] = useState(true);
  const [streak, setStreak] = useState<number | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  // Eventi in tendenza (anteprima 3–4)
  const [eventsTrending, setEventsTrending] = useState<Event[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Spin e Missioni
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
    resolveClosedEvents().catch(() => {});
  }, []);

  // Top summary: crediti, classifica settimanale, streak
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

  // Eventi in tendenza (anteprima illustrativa, max 4)
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingTrending(true);
    setEventsError(null);
    const params = new URLSearchParams({ sort: "popular", status: "open", limit: "4" });
    fetch(`/api/events?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setEventsTrending(data?.events ?? []))
      .catch(() => {
        setEventsError("Impossibile caricare gli eventi.");
        setEventsTrending([]);
      })
      .finally(() => setLoadingTrending(false));
  }, [status]);

  // Missioni (anteprima per home)
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

  // —— Landing per utenti non loggati (Fase 1)
  const showLanding = status === "unauthenticated";
  const [landingEvents, setLandingEvents] = useState<Event[]>([]);
  const [landingEventsLoading, setLandingEventsLoading] = useState(false);
  const fetchLandingEvents = useCallback(async () => {
    if (!showLanding) return;
    setLandingEventsLoading(true);
    try {
      const res = await fetch("/api/events?filter=popular&limit=5&status=open");
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <LoadingBlock message="" />
      </div>
    );
  }

  if (showLanding) {
    return (
      <div className="min-h-screen bg-bg relative">
        <div className="landing-bg" aria-hidden />
        <Header />
        <main className="relative mx-auto px-page-x py-page-y md:py-10 lg:py-14 max-w-2xl">
          {/* 1) HERO */}
          <section className="text-center mb-10 md:mb-14">
            <h1 className="text-ds-display font-bold text-fg mb-3 md:mb-4 max-w-xl mx-auto leading-tight">
              Prevedi il futuro. Guadagna crediti. Scala la classifica.
            </h1>
            <p className="text-ds-body md:text-lg text-fg-muted max-w-xl mx-auto mb-6 md:mb-8 leading-snug">
              Partecipa ai mercati sociali su eventi reali usando solo crediti virtuali. Più sei preciso, più sali in classifica.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <CTAButton href="/auth/signup" variant="primary" fullWidth className="sm:w-auto">
                Inizia ora – 100 crediti gratis
              </CTAButton>
              <Link
                href="/auth/login"
                className="text-ds-body-sm font-medium text-fg-muted hover:text-fg transition-colors focus-visible:underline min-h-[48px] flex items-center justify-center"
              >
                Accedi
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-ds-micro font-semibold text-fg-muted bg-surface/60 border border-border dark:border-white/10">
                Eventi in tempo reale
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-ds-micro font-semibold text-fg-muted bg-surface/60 border border-border dark:border-white/10">
                Classifiche settimanali
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-ds-micro font-semibold text-fg-muted bg-surface/60 border border-border dark:border-white/10">
                Nessun rischio reale (NO soldi veri)
              </span>
            </div>
          </section>

          {/* 2) EVENT FEED PREVIEW */}
          <section className="mb-10 md:mb-14">
            <h2 className="text-ds-h2 font-bold text-fg mb-4">Eventi in corso</h2>
            {landingEventsLoading ? (
              <LoadingBlock message="Caricamento eventi..." />
            ) : landingEvents.length === 0 ? (
              <EmptyState
                title="Nessun evento attivo ora"
                description="Intanto completa le missioni di onboarding e guadagna crediti."
                action={{ label: "Inizia ora – 100 crediti gratis", href: "/auth/signup" }}
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

          {/* 3) PERCHÉ GIOCARE */}
          <section className="mb-10 md:mb-14">
            <h2 className="text-ds-h2 font-bold text-fg mb-4 text-center">Perché giocare</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-border dark:border-white/10 glass p-5 text-center">
                <div className="text-2xl mb-2" aria-hidden>🏆</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Classifiche settimanali</h3>
                <p className="text-ds-body-sm text-fg-muted">Sali in classifica ogni settimana e confrontati con la community.</p>
              </div>
              <div className="rounded-2xl border border-border dark:border-white/10 glass p-5 text-center">
                <div className="text-2xl mb-2" aria-hidden>🎯</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Missioni & streak giornaliere</h3>
                <p className="text-ds-body-sm text-fg-muted">Completa missioni e mantieni lo streak per guadagnare crediti extra.</p>
              </div>
              <div className="rounded-2xl border border-border dark:border-white/10 glass p-5 text-center">
                <div className="text-2xl mb-2" aria-hidden>📋</div>
                <h3 className="text-ds-body font-bold text-fg mb-1">Eventi reali con regole trasparenti</h3>
                <p className="text-ds-body-sm text-fg-muted">Ogni evento ha criteri di risoluzione chiari e verificabili.</p>
              </div>
            </div>
          </section>

          {/* CTA sempre visibile in fondo */}
          <section className="text-center pt-4 pb-8">
            <CTAButton href="/auth/signup" variant="primary" fullWidth className="max-w-sm mx-auto">
              Inizia ora – 100 crediti gratis
            </CTAButton>
          </section>
        </main>
      </div>
    );
  }

  const displayName = session?.user?.name || session?.user?.email || "utente";

  const refetchTrending = () => {
    setLoadingTrending(true);
    setEventsError(null);
    const params = new URLSearchParams({ sort: "popular", status: "open", limit: "4" });
    fetch(`/api/events?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setEventsTrending(data?.events ?? []))
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

        {/* 1) Summary box */}
        <HomeSummary
          credits={credits}
          weeklyRank={weeklyRank}
          streak={streak}
          creditsLoading={creditsLoading}
          rankLoading={rankLoading}
          streakLoading={streakLoading}
        />

        {/* 2) Spin of the day */}
        <section
          className="mb-section md:mb-section-lg"
          aria-label="Spin of the Day"
        >
          <Link
            href="/spin"
            className="block rounded-2xl border-2 border-primary/30 bg-primary/5 glass p-4 md:p-5 hover:border-primary/50 hover:shadow-glow-sm transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
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
                Hai <strong className="text-primary">1 spin gratuito</strong> oggi. Crediti o boost!
              </p>
            ) : (
              <p className="text-ds-body-sm text-fg-muted">
                Spin di oggi usato. Torna domani.
              </p>
            )}
          </Link>
        </section>

        {/* 3) Missioni */}
        <section
          className="mb-section md:mb-section-lg"
          aria-label="Missioni"
        >
          <Link
            href="/missions"
            className="block rounded-2xl border border-border dark:border-white/10 glass p-4 md:p-5 hover:border-primary/20 hover:shadow-glow-sm transition-all duration-ds-normal group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
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

        {/* 4) Eventi in tendenza (anteprima illustrativa) */}
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
