"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import HomeEventTile from "@/components/home/HomeEventTile";
import LandingHeroStats from "@/components/landing/LandingHeroStats";
import LandingHeroTitle from "@/components/landing/LandingHeroTitle";
import LandingWhyFlip from "@/components/landing/LandingWhyFlip";
import HomeHeaderPostLogin from "@/components/home/HomeHeaderPostLogin";
import HomeCarouselBox, { type HomeEventTileData } from "@/components/home/HomeCarouselBox";
import type { HomeEventTileVariant } from "@/components/home/HomeEventTile";
import { EmptyState, LoadingBlock } from "@/components/ui";
import { getDisplayTitle, isDebugTitle } from "@/lib/debug-display";
import type { EventFomoStats } from "@/lib/fomo/event-stats";
import { getEventProbability } from "@/lib/pricing/price-display";
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

function eventToTileData(e: Event): HomeEventTileData {
  const yesPct =
    e.q_yes != null && e.q_no != null && e.b != null
      ? Math.round(getEventProbability({ q_yes: e.q_yes, q_no: e.q_no, b: e.b }))
      : Math.round(e.probability ?? 50);
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    closesAt: e.closesAt,
    yesPct,
    predictionsCount: e._count?.predictions,
  };
}

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
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
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

  const [mostPredicted, setMostPredicted] = useState<HomeEventTileData[]>([]);
  const [loadingMostPredicted, setLoadingMostPredicted] = useState(true);
  const [closingSoon, setClosingSoon] = useState<HomeEventTileData[]>([]);
  const [loadingClosingSoon, setLoadingClosingSoon] = useState(true);
  const [forYouEvents, setForYouEvents] = useState<HomeEventTileData[]>([]);
  const [loadingForYou, setLoadingForYou] = useState(true);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionsLoading, setMissionsLoading] = useState(false);
  const [canSpinToday, setCanSpinToday] = useState<boolean | null>(null);
  const [weeklyRank, setWeeklyRank] = useState<number | undefined>(undefined);

  const whySectionRef = useRef<HTMLElement>(null);
  const [whySectionInView, setWhySectionInView] = useState(false);
  useEffect(() => {
    const el = whySectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setWhySectionInView(true);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
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

  const fetchMostPredicted = useCallback(() => {
    setLoadingMostPredicted(true);
    fetch("/api/events?sort=popular&limit=8&status=open")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []).map((e: Event) => eventToTileData(e));
        setMostPredicted(list);
      })
      .catch(() => setMostPredicted([]))
      .finally(() => setLoadingMostPredicted(false));
  }, []);

  const fetchClosingSoon = useCallback(() => {
    setLoadingClosingSoon(true);
    fetch("/api/events/closing-soon?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []).map((e: Event) => eventToTileData(e));
        setClosingSoon(list);
      })
      .catch(() => setClosingSoon([]))
      .finally(() => setLoadingClosingSoon(false));
  }, []);

  const fetchForYou = useCallback(() => {
    setLoadingForYou(true);
    fetch("/api/feed/for-you?limit=16")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []).map((e: Event) => eventToTileData(e));
        setForYouEvents(list);
      })
      .catch(() => setForYouEvents([]))
      .finally(() => setLoadingForYou(false));
  }, []);

  const refetchHomeFeeds = useCallback(() => {
    fetchMostPredicted();
    fetchClosingSoon();
    fetchForYou();
  }, [fetchMostPredicted, fetchClosingSoon, fetchForYou]);

  // Carica feed alla mount e quando si torna sulla home (visibility o pathname)
  useEffect(() => {
    if (status !== "authenticated") return;
    refetchHomeFeeds();
  }, [status, refetchHomeFeeds]);

  useEffect(() => {
    if (status !== "authenticated" || pathname !== "/") return;
    const onVisible = () => refetchHomeFeeds();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [status, pathname, refetchHomeFeeds]);

  // Ripristino scroll quando si torna indietro da un evento (solo se salvataggio recente)
  useEffect(() => {
    if (pathname !== "/" || typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("homeScroll");
      if (!raw) return;
      const data = JSON.parse(raw) as { y: number; t: number };
      sessionStorage.removeItem("homeScroll");
      const maxAge = 60 * 1000; // 1 minuto
      if (Number.isFinite(data.y) && Date.now() - (data.t || 0) < maxAge) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => window.scrollTo(0, data.y));
        });
      }
    } catch {
      sessionStorage.removeItem("homeScroll");
    }
  }, [pathname]);

  const handleEventClick = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "homeScroll",
        JSON.stringify({ y: window.scrollY, t: Date.now() })
      );
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    setMissionsLoading(true);
    fetch("/api/missions")
      .then((r) => r.ok && r.json())
      .then((data) => setMissions(data?.daily ?? []))
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

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/leaderboard?period=weekly")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data?.myRank != null ? setWeeklyRank(data.myRank) : setWeeklyRank(undefined)))
      .catch(() => setWeeklyRank(undefined));
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
      const res = await fetch("/api/events?sort=recent&limit=10&status=open");
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
        <Header />
        <main id="main-content" className="relative mx-auto px-4 py-4 sm:px-6 sm:py-6 md:py-10 lg:py-12 max-w-2xl">
          {/* Hero: una schermata = solo fino ai contatori; contatori alla stessa altezza di "Eventi in corso" */}
          <section
            className="landing-hero-section flex flex-col min-h-[var(--landing-hero-min-h)] pt-1 pb-6 md:pt-2 md:pb-8"
          >
            <div className="landing-hero-card px-4 py-0 md:px-10 md:py-0 text-center flex flex-col flex-1 min-h-0">
              {/* Blocco testo + CTA centrato in altezza nello spazio sopra i contatori */}
              <div className="flex flex-1 min-h-0 flex-col justify-center py-4 md:py-6">
                <p className="landing-hero-eyebrow text-[0.7rem] sm:text-ds-caption font-semibold uppercase tracking-wider mb-2 md:mb-2.5 text-white/95 text-center max-w-full break-words leading-snug">
                  Mercati di previsione – Solo crediti virtuali
                </p>
                <div className="landing-hero-line mt-[1cm] mb-2.5 md:mb-3" aria-hidden />
                <LandingHeroTitle />
                <div className="landing-hero-line landing-hero-line--below my-3 md:my-4" aria-hidden />
                <p className="landing-hero-subtitle text-ds-body-landing font-normal text-white/90 max-w-md mx-auto leading-snug text-center mb-[0.8cm]">
                  Se pensi di saperlo prima degli altri,
                  <br />
                  <span className="landing-hero-subtitle-emphasis">è il momento di provarlo.</span>
                </p>
                <div className="landing-hero-line landing-hero-line--cta mt-0 mb-4 md:mb-6" aria-hidden />
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <Link
                    href="/auth/signup"
                    className="landing-cta-primary w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  >
                    Prevedi ora — 1000 crediti di benvenuto!
                  </Link>
                  <Link
                    href="/auth/login"
                    className="landing-cta-secondary w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-ds-body inline-flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  >
                    Già account? Accedi
                  </Link>
                </div>
              </div>
              <div className="shrink-0 pt-4 md:pt-6">
                <LandingHeroStats />
              </div>
            </div>
          </section>

          <section className="mb-8 md:mb-12 pt-6 md:pt-8" aria-label="Eventi in corso">
            <h2 className="landing-section-title landing-section-title--no-underline text-ds-h2 font-bold text-fg mb-3 sm:mb-4">
              <span className="landing-section-title__text">Eventi in corso</span>
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
              <div className="grid grid-cols-2 gap-1 sm:gap-1.5" role="list" aria-label="Anteprima eventi">
                {(debugMode ? landingEvents : landingEvents.filter((e) => !isDebugTitle(e.title))).map((event) => {
                  const tile = eventToTileData(event);
                  return (
                    <div key={event.id} role="listitem">
                      <HomeEventTile
                        id={tile.id}
                        title={getDisplayTitle(tile.title, debugMode)}
                        category={tile.category}
                        closesAt={tile.closesAt}
                        yesPct={tile.yesPct}
                        predictionsCount={tile.predictionsCount}
                        variant={"popular" satisfies HomeEventTileVariant}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section ref={whySectionRef} className="mb-8 md:mb-12">
            <h2 className="text-ds-h2 font-bold text-fg mb-4 sm:mb-5 text-center">
              Perché giocare
            </h2>
            <LandingWhyFlip />
          </section>

          <section className="text-center pt-4 pb-8 sm:pt-6 sm:pb-10">
            <div className="landing-hero-card inline-block px-5 py-5 sm:px-8 sm:py-6 md:px-10 md:py-8">
              <p className="text-ds-body font-semibold text-white mb-3">Pronto a iniziare?</p>
              <Link
                href="/auth/signup"
                className="landing-cta-primary landing-cta-primary--blue w-full max-w-sm mx-auto min-h-[48px] px-6 py-4 rounded-xl font-semibold text-ds-body-sm text-white inline-flex items-center justify-center transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
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

  return (
    <div className="min-h-screen bg-bg">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header />
      <main id="main-content" className="mx-auto px-page-x py-page-y md:py-8 max-w-6xl">
        {/* Debug panel: only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true. */}
        {debugMode && (
          <div className="text-ds-micro text-fg-muted mb-2 p-2 rounded bg-white/5" aria-hidden>
            <p>debug: commit={debugInfo?.version?.commit ?? "—"} env={debugInfo?.version?.env ?? "—"} baseUrl={debugInfo?.version?.baseUrl ? `${debugInfo.version.baseUrl.slice(0, 40)}…` : "—"}</p>
            <p>dbConnected={String(debugInfo?.health?.dbConnected ?? "—")} forYou={forYouEvents.length} closingSoon={closingSoon.length} mostPredicted={mostPredicted.length}</p>
          </div>
        )}

        <HomeHeaderPostLogin
          displayName={displayName}
          userImage={session?.user?.image ?? null}
          credits={credits}
          creditsLoading={creditsLoading}
          weeklyRank={weeklyRank}
          canSpinToday={canSpinToday}
          spinLoading={spinLoading}
          missions={missions}
          missionsLoading={missionsLoading}
        />

        <div className="pt-4 sm:pt-5">
          <HomeCarouselBox
            title="Più previsti ora"
            viewAllHref="/esplora?category=tutti&status=open&sort=popular"
            viewAllLabel="Vedi tutti"
            events={debugMode ? mostPredicted : mostPredicted.filter((e) => !isDebugTitle(e.title))}
            loading={loadingMostPredicted}
            variant="popular"
            onEventNavigate={handleEventClick}
          />
        </div>

        <div className="border-t border-white/10 pt-4 sm:pt-5">
          <HomeCarouselBox
            title="Eventi in scadenza"
            viewAllHref="/esplora?category=tutti&status=open&sort=expiring"
            viewAllLabel="Vedi tutti"
            events={debugMode ? closingSoon : closingSoon.filter((e) => !isDebugTitle(e.title))}
            loading={loadingClosingSoon}
            variant="closing"
            onEventNavigate={handleEventClick}
          />
        </div>

        <div className="border-t border-white/10 pt-4 sm:pt-5">
          <HomeCarouselBox
            title="Potrebbe piacerti"
            viewAllHref="/esplora?category=tutti&status=open&sort=popular"
            viewAllLabel="Vedi tutti"
            events={debugMode ? forYouEvents : forYouEvents.filter((e) => !isDebugTitle(e.title))}
            loading={loadingForYou}
            variant="foryou"
            onEventNavigate={handleEventClick}
          />
        </div>

        <section className="text-center pt-8 pb-6" aria-label="Invito a esplorare">
          <div className="landing-hero-card inline-block rounded-2xl px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-ds-body font-semibold text-white mb-3">
              Non sai da dove iniziare?
            </p>
            <Link
              href="/discover/consigliati"
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
