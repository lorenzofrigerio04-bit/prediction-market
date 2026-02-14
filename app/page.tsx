"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import EventCard from "@/components/EventCard";
import OnboardingTour from "@/components/OnboardingTour";
import HeroMarquee from "@/components/landing/HeroMarquee";
import BreakingNewsTicker, { type NewsItem } from "@/components/landing/BreakingNewsTicker";
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

interface WalletStats {
  canClaimDailyBonus: boolean;
  nextBonusAmount?: number;
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

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
}

type HomeSectionTab = "expiring" | "popular" | "foryou";

export default function Home() {
  const pathname = usePathname();
  const { data: session, status, update: updateSession } = useSession();
  const [eventsExpiring, setEventsExpiring] = useState<Event[]>([]);
  const [eventsPopular, setEventsPopular] = useState<Event[]>([]);
  const [eventsForYou, setEventsForYou] = useState<Event[]>([]);
  const [loadingExpiring, setLoadingExpiring] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [sectionTab, setSectionTab] = useState<HomeSectionTab>("expiring");
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [sessionSynced, setSessionSynced] = useState(false);
  const sessionSyncDone = useRef(false);

  // Daily bonus
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [dailyBonusLoading, setDailyBonusLoading] = useState(false);
  // Missions
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  // Leaderboard teaser
  const [leaderboardTop, setLeaderboardTop] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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

  const fetchSectionEvents = useCallback(
    async (filter: "expiring" | "popular", setEvents: (e: Event[]) => void, setLoading: (l: boolean) => void) => {
      setLoading(true);
      setEventsError(null);
      try {
        const params = new URLSearchParams({
          filter,
          limit: "6",
          status: "open",
        });
        const res = await fetch(`/api/events?${params}`);
        if (!res.ok) throw new Error("Failed to fetch events");
        const data: EventsResponse = await res.json();
        setEvents(data.events ?? []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setEventsError("Impossibile caricare gli eventi.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    resolveClosedEvents().catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchSectionEvents("expiring", setEventsExpiring, setLoadingExpiring);
    fetchSectionEvents("popular", setEventsPopular, setLoadingPopular);
    fetchSectionEvents("popular", setEventsForYou, setLoadingForYou); // "Per te" = tendenza per ora
  }, [status, fetchSectionEvents]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/wallet/stats")
      .then((r) => r.ok && r.json())
      .then((data) => data && setWalletStats({ canClaimDailyBonus: data.canClaimDailyBonus, nextBonusAmount: data.nextBonusAmount }))
      .catch(() => {});
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setMissionsLoading(true);
    fetch("/api/missions")
      .then((r) => r.ok && r.json())
      .then((data) => {
        const daily = (data?.daily ?? []).slice(0, 3);
        setMissions(daily);
      })
      .catch(() => setMissions([]))
      .finally(() => setMissionsLoading(false));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setLeaderboardLoading(true);
    fetch("/api/leaderboard?period=all-time")
      .then((r) => r.ok && r.json())
      .then((data) => (data?.leaderboard ?? []).slice(0, 3).map((u: LeaderboardUser & { rank: number }) => ({ rank: u.rank, id: u.id, name: u.name, image: u.image })))
      .then(setLeaderboardTop)
      .catch(() => setLeaderboardTop([]))
      .finally(() => setLeaderboardLoading(false));
  }, [status]);

  const claimDailyBonus = async () => {
    setDailyBonusLoading(true);
    try {
      const res = await fetch("/api/wallet/daily-bonus", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setWalletStats((prev) => (prev ? { ...prev, canClaimDailyBonus: false } : null));
        await updateSession();
      }
    } finally {
      setDailyBonusLoading(false);
    }
  };

  const sectionTabs: { id: HomeSectionTab; label: string }[] = [
    { id: "expiring", label: "In scadenza" },
    { id: "popular", label: "In tendenza" },
    { id: "foryou", label: "Per te" },
  ];

  const getSectionEvents = () => {
    if (sectionTab === "expiring") return eventsExpiring;
    if (sectionTab === "popular") return eventsPopular;
    return eventsForYou;
  };

  const getSectionLoading = () => {
    if (sectionTab === "expiring") return loadingExpiring;
    if (sectionTab === "popular") return loadingPopular;
    return loadingForYou;
  };

  // —— Landing per utenti non loggati (Fase 1)
  const showLanding = status === "unauthenticated";
  const [landingEvents, setLandingEvents] = useState<Event[]>([]);
  const [landingEventsLoading, setLandingEventsLoading] = useState(false);
  const fetchLandingEvents = useCallback(async () => {
    if (!showLanding) return;
    setLandingEventsLoading(true);
    try {
      const res = await fetch("/api/events?filter=popular&limit=4&status=open");
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
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (showLanding) {
    const newsFromEvents: NewsItem[] | undefined = landingEvents.length > 0
      ? landingEvents.slice(0, 6).map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          timeAgo: "Ora",
          href: `/events/${e.id}`,
          live: true,
        }))
      : undefined;

    return (
      <div className="min-h-screen bg-bg relative">
        <div className="landing-bg" aria-hidden />
        <Header />
        <main className="relative mx-auto px-4 py-6 md:py-10 lg:py-14 max-w-6xl">
          {/* Ticker orizzontale: ultime notizie / eventi */}
          <section className="mb-8 md:mb-12">
            <BreakingNewsTicker items={newsFromEvents} />
          </section>

          {/* Hero: titolo + CTA */}
          <section className="text-center mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-fg mb-4 md:mb-6 tracking-tight max-w-5xl mx-auto leading-[1.1]">
              Dimostra di capire il mondo prima degli altri.
            </h1>
            <p className="text-fg-muted text-lg md:text-xl lg:text-2xl max-w-2xl mx-auto mb-8 md:mb-10 font-medium">
              Prevedi eventi con crediti virtuali, senza rischi. Accumula punti e sali in classifica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto min-h-[52px] px-10 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover transition-all shadow-glow hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg"
              >
                Registrati
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto min-h-[52px] px-10 py-4 glass border border-border dark:border-white/10 text-fg font-semibold rounded-2xl hover:border-primary/20 hover:bg-white/10 dark:hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg"
              >
                Accedi
              </Link>
            </div>
          </section>

          {/* Frase orizzontale tipo Stripe */}
          <section className="mb-10 md:mb-14">
            <HeroMarquee />
          </section>

          {/* Crediti · Nessun prelievo · Trasparente */}
          <section className="mb-10 md:mb-14 py-6 md:py-8 border-y border-white/10 dark:border-white/5">
            <p className="text-center text-fg-muted text-sm md:text-base font-medium tracking-wide">
              Crediti virtuali · Nessun prelievo · Risoluzione trasparente
            </p>
          </section>

          {/* Eventi in tendenza */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-fg mb-4 md:mb-6">Eventi in tendenza</h2>
            {landingEventsLoading ? (
              <div className="flex justify-center py-12">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
              </div>
            ) : landingEvents.length === 0 ? (
              <div className="text-center py-12 md:py-16 glass rounded-3xl border border-border dark:border-white/10 max-w-lg mx-auto px-6">
                <p className="text-fg-muted text-base md:text-lg">
                  Presto nuovi eventi. Iscriviti per non perderli.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {landingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  const displayName = session?.user?.name || session?.user?.email || "utente";
  const sectionEvents = getSectionEvents();
  const sectionLoading = getSectionLoading();

  return (
    <div className="min-h-screen bg-bg">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header />
      <main className="mx-auto px-4 py-5 md:py-8 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold text-fg mb-1 tracking-tight">
          Bentornato, {displayName}.
        </h1>
        <p className="text-fg-muted text-sm md:text-base mb-6">
          Ecco cosa succede oggi.
        </p>

        {/* Daily bonus widget */}
        <section className="mb-6 md:mb-8">
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-fg mb-1">Crediti giornalieri</h2>
              <p className="text-fg-muted text-sm">
                {walletStats?.canClaimDailyBonus
                  ? `Ritira fino a ${walletStats?.nextBonusAmount ?? 100}+ crediti.`
                  : "Prossimo bonus domani."}
              </p>
            </div>
            {walletStats?.canClaimDailyBonus ? (
              <button
                type="button"
                disabled={dailyBonusLoading}
                onClick={claimDailyBonus}
                className="shrink-0 min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover transition-colors shadow-glow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-60"
              >
                {dailyBonusLoading ? "Attendere..." : "Ritira i crediti giornalieri"}
              </button>
            ) : (
              <span className="shrink-0 min-h-[48px] px-6 py-3 rounded-2xl bg-surface/50 text-fg-muted font-medium border border-border dark:border-white/10 flex items-center">
                Prossimo bonus domani
              </span>
            )}
          </div>
        </section>

        {/* Missions widget */}
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-fg">Missioni di oggi</h2>
            <Link
              href="/missions"
              className="text-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
            >
              Completa per guadagnare crediti
            </Link>
          </div>
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-4">
            {missionsLoading ? (
              <div className="flex justify-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
              </div>
            ) : missions.length === 0 ? (
              <p className="text-fg-muted text-sm py-2">Nessuna missione attiva oggi. Torna domani.</p>
            ) : (
              <ul className="space-y-3">
                {missions.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 py-2 border-b border-border dark:border-white/10 last:border-0">
                    <div>
                      <p className="font-medium text-fg">{m.name}</p>
                      {m.description && <p className="text-xs text-fg-muted">{m.description}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      {m.completed ? "Completata" : `${m.progress}/${m.target}`} · +{m.reward} cr
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Event sections (tabs) */}
        <section className="mb-6 md:mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin md:overflow-visible">
              {sectionTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSectionTab(tab.id)}
                  className={`shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl font-semibold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    sectionTab === tab.id
                      ? "bg-primary text-white shadow-glow"
                      : "glass text-fg-muted border border-border dark:border-white/10 hover:border-primary/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <Link
              href="/discover"
              className="shrink-0 text-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
            >
              Esplora tutti
            </Link>
          </div>

          {eventsError ? (
            <div className="text-center py-12 glass rounded-3xl border border-border dark:border-white/10 max-w-md mx-auto px-6">
              <p className="text-fg-muted mb-4">{eventsError}</p>
              <button
                type="button"
                onClick={() => {
                  fetchSectionEvents("expiring", setEventsExpiring, setLoadingExpiring);
                  fetchSectionEvents("popular", setEventsPopular, setLoadingPopular);
                  fetchSectionEvents("popular", setEventsForYou, setLoadingForYou);
                }}
                className="min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                Riprova
              </button>
            </div>
          ) : sectionLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
              <p className="mt-4 text-fg-muted font-medium">Caricamento eventi...</p>
            </div>
          ) : sectionEvents.length === 0 ? (
            <div className="text-center py-12 md:py-16 glass rounded-3xl border border-border dark:border-white/10 max-w-lg mx-auto px-6">
              <p className="text-fg-muted text-base md:text-lg mb-2">
                Nessun evento al momento. Torna più tardi o esplora le categorie.
              </p>
              <Link
                href="/discover"
                className="inline-block mt-4 min-h-[48px] px-6 py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                Scopri le previsioni
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {sectionEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* Leaderboard teaser */}
        <section className="mb-8">
          <div className="glass rounded-2xl border border-border dark:border-white/10 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-fg">Classifica</h2>
              <Link
                href="/leaderboard"
                className="text-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
              >
                Vedi classifica
              </Link>
            </div>
            {leaderboardLoading ? (
              <div className="flex justify-center py-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
              </div>
            ) : leaderboardTop.length === 0 ? (
              <p className="text-fg-muted text-sm py-2">Nessun dato. Fai previsioni per salire in classifica!</p>
            ) : (
              <ol className="space-y-2">
                {leaderboardTop.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 py-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/20 text-primary font-bold text-sm">
                      {u.rank}
                    </span>
                    <span className="font-medium text-fg truncate">{u.name || "Utente"}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
