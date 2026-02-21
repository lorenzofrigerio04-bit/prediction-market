"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import LandingEventRow from "@/components/landing/LandingEventRow";
import LandingHeroStats from "@/components/landing/LandingHeroStats";
import LandingHeroTitle from "@/components/landing/LandingHeroTitle";
import HomeHeaderPostLogin from "@/components/home/HomeHeaderPostLogin";
import HomeCarouselBox, { type HomeEventTileData } from "@/components/home/HomeCarouselBox";
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

  // Più previsti ora (8 eventi, sort=popular)
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingMostPredicted(true);
    fetch("/api/events?sort=popular&limit=8&status=open")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []).map((e: Event) => eventToTileData(e));
        setMostPredicted(list);
      })
      .catch(() => setMostPredicted([]))
      .finally(() => setLoadingMostPredicted(false));
  }, [status]);

  // Eventi in scadenza (8)
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingClosingSoon(true);
    fetch("/api/events/closing-soon?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []).map((e: Event) => eventToTileData(e));
        setClosingSoon(list);
      })
      .catch(() => setClosingSoon([]))
      .finally(() => setLoadingClosingSoon(false));
  }, [status]);

  // Potrebbe piacerti (16, personalizzato o trend)
  useEffect(() => {
    if (status !== "authenticated") return;
    setLoadingForYou(true);
    fetch("/api/feed/for-you?limit=16")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const list = (data?.events ?? []).map((e: Event) => eventToTileData(e));
        setForYouEvents(list);
      })
      .catch(() => setForYouEvents([]))
      .finally(() => setLoadingForYou(false));
  }, [status]);

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
            <h2 className="landing-section-title text-ds-h2 font-bold text-fg mb-6">
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

          <section ref={whySectionRef} className="mb-12 md:mb-16">
            <h2 className="landing-section-title text-ds-h2 font-bold text-fg mb-6 text-center">
              Perché giocare
            </h2>
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 landing-why-section ${whySectionInView ? "landing-why-section--in-view" : ""}`}>
              <div className="landing-why-box p-5 md:p-6 text-center hover-lift transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/30 text-2xl mb-3" aria-hidden>🏆</div>
                <h3 className="text-ds-body font-bold text-white mb-1">Classifiche settimanali</h3>
                <p className="text-ds-body-sm text-white/85">Sali in classifica ogni settimana e confrontati con la community.</p>
              </div>
              <div className="landing-why-box p-5 md:p-6 text-center hover-lift transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/30 text-2xl mb-3" aria-hidden>🎯</div>
                <h3 className="text-ds-body font-bold text-white mb-1">Missioni & streak</h3>
                <p className="text-ds-body-sm text-white/85">Completa missioni e mantieni lo streak per crediti extra.</p>
              </div>
              <div className="landing-why-box p-5 md:p-6 text-center hover-lift transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/30 text-2xl mb-3" aria-hidden>📋</div>
                <h3 className="text-ds-body font-bold text-white mb-1">Regole trasparenti</h3>
                <p className="text-ds-body-sm text-white/85">Ogni evento ha criteri di risoluzione chiari e verificabili.</p>
              </div>
            </div>
          </section>

          <section className="text-center pt-6 pb-10">
            <div className="landing-hero-card inline-block px-8 py-6 md:px-10 md:py-8">
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
          canSpinToday={canSpinToday}
          spinLoading={spinLoading}
          missions={missions}
          missionsLoading={missionsLoading}
        />

        <HomeCarouselBox
          title="Più previsti ora"
          viewAllHref="/discover/tutti?status=open&sort=popular"
          viewAllLabel="Vedi tutti"
          events={debugMode ? mostPredicted : mostPredicted.filter((e) => !isDebugTitle(e.title))}
          loading={loadingMostPredicted}
          variant="popular"
        />

        <HomeCarouselBox
          title="Eventi in scadenza"
          viewAllHref="/discover/tutti?status=open&sort=expiring"
          viewAllLabel="Vedi tutti"
          events={debugMode ? closingSoon : closingSoon.filter((e) => !isDebugTitle(e.title))}
          loading={loadingClosingSoon}
          variant="closing"
        />

        <HomeCarouselBox
          title="Potrebbe piacerti"
          viewAllHref="/discover/tutti"
          viewAllLabel="Esplora tutti"
          events={debugMode ? forYouEvents : forYouEvents.filter((e) => !isDebugTitle(e.title))}
          loading={loadingForYou}
          variant="foryou"
        />

        <section className="text-center pt-8 pb-6" aria-label="Invito a esplorare">
          <div className="landing-hero-card inline-block rounded-2xl px-6 py-5 sm:px-8 sm:py-6">
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
