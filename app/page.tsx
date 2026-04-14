"use client";

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import { HomeUnifiedFeed } from "@/components/home/HomeUnifiedFeed";
import LandingTrendingMarketCard from "@/components/landing/LandingTrendingMarketCard";
import { LoadingBlock } from "@/components/ui";
import { getDisplayTitle, isDebugTitle } from "@/lib/debug-display";
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

const ONBOARDING_STORAGE_KEY = "prediction-market-onboarding-completed";

function HomeContent() {
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
  const landingFeedRequestInFlightRef = useRef(false);

  const [homeFeedLoading, setHomeFeedLoading] = useState(false);
  const landingEventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [landingTop24hEvents, setLandingTop24hEvents] = useState<
    Array<{
      id: string;
      title: string;
      category: string;
      closesAt: string;
      yesPct: number;
      predictionsCount?: number;
      aiImageUrl?: string | null;
      marketType?: string | null;
      outcomes?: Array<{ key: string; label: string }> | null;
      outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
      createdAt?: string;
    }>
  >([]);

  const fetchLandingFeed = useCallback(async () => {
    if (landingFeedRequestInFlightRef.current) return;
    landingFeedRequestInFlightRef.current = true;
    setHomeFeedLoading(true);
    try {
      const res = await fetch("/api/feed/home-unified?limit=24", { cache: "no-store" });
      if (!res.ok) throw new Error("Feed error");
      const data = await res.json();
      const top24h = (data?.rows?.top24h ?? []) as Array<{
        id: string;
        title: string;
        category: string;
        closesAt: string;
        yesPct: number;
        predictionsCount?: number;
        aiImageUrl?: string | null;
        marketType?: string | null;
        outcomes?: Array<{ key: string; label: string }> | null;
        outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
        createdAt?: string;
      }>;
      setLandingTop24hEvents(top24h);
    } catch {
      setLandingTop24hEvents([]);
    } finally {
      setHomeFeedLoading(false);
      landingFeedRequestInFlightRef.current = false;
    }
  }, []);

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

  const [alreadyCompletedThisSession, setAlreadyCompletedThisSession] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(ONBOARDING_STORAGE_KEY) === "true") {
      setAlreadyCompletedThisSession(true);
    }
  }, []);

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

  const prevPathnameRef = useRef(pathname);

  // Nasconde scrollbar laterale sulla homepage
  useEffect(() => {
    if (pathname === "/") {
      document.documentElement.classList.add("scrollbar-hide");
      document.body.classList.add("scrollbar-hide");
    } else {
      document.documentElement.classList.remove("scrollbar-hide");
      document.body.classList.remove("scrollbar-hide");
    }
    return () => {
      document.documentElement.classList.remove("scrollbar-hide");
      document.body.classList.remove("scrollbar-hide");
    };
  }, [pathname]);

  // Al ritorno sulla home (pathname o visibility) aggiorna il feed
  useEffect(() => {
    if (pathname === "/" && prevPathnameRef.current !== "/") {
      fetchLandingFeed();
    }
    prevPathnameRef.current = pathname;
  }, [pathname, fetchLandingFeed]);

  useEffect(() => {
    if (pathname !== "/") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        fetchLandingFeed();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [pathname, fetchLandingFeed]);

  const HOME_FEEDS_POLL_MS = 30_000;
  useEffect(() => {
    if (status !== "authenticated" || pathname !== "/") return;
    const poll = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchLandingFeed();
      }
    };
    const id = setInterval(poll, HOME_FEEDS_POLL_MS);
    return () => clearInterval(id);
  }, [status, pathname, fetchLandingFeed]);

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

  // Genera notifiche on-demand quando utente apre Home (best-effort)
  useEffect(() => {
    if (status === "authenticated") {
      generateNotificationsOnDemand();
    }
  }, [status]);

  const showLanding = status === "unauthenticated";
  const landingTrendingEvents = useMemo(() => {
    const seen = new Set<string>();
    const flattened = landingTop24hEvents.map((event) => ({
      ...event,
      title: getDisplayTitle(event.title, debugMode),
    }));

    const filtered = flattened.filter((event) => (debugMode ? true : !isDebugTitle(event.title)));
    const deduped = filtered.filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });

    const now = Date.now();
    const in24h = deduped.filter((event) => {
      if (!event.createdAt) return false;
      const createdMs = new Date(event.createdAt).getTime();
      return Number.isFinite(createdMs) && now - createdMs <= 24 * 60 * 60 * 1000;
    });

    return (in24h.length > 0 ? in24h : deduped).slice(0, 10);
  }, [landingTop24hEvents, debugMode]);

  const landingHasEvents = landingTrendingEvents.length > 0;

  const setLandingEventRef = useCallback((eventId: string, node: HTMLDivElement | null) => {
    if (node) {
      landingEventRefs.current.set(eventId, node);
      return;
    }
    landingEventRefs.current.delete(eventId);
  }, []);

  useEffect(() => {
    if (!showLanding || !landingHasEvents || typeof window === "undefined") {
      return;
    }

    let rafId: number | null = null;
    let scheduled = false;

    const applyFocusEffect = () => {
      scheduled = false;
      const viewportCenter = window.innerHeight / 2;
      const maxDistance = Math.max(window.innerHeight * 0.58, 300);

      for (const event of landingTrendingEvents) {
        const node = landingEventRefs.current.get(event.id);
        if (!node) continue;

        const cardNode = node.firstElementChild as HTMLElement | null;
        const rankNode = node.querySelector(".landing-trending-rank") as HTMLElement | null;
        if (!cardNode) continue;

        const rect = node.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        const proximity = Math.max(0, 1 - distance / maxDistance);

        const scale = 0.88 + proximity * 0.12;
        const lift = -Math.round(proximity * 6);
        const brightness = 0.86 + proximity * 0.24;
        const saturation = 0.84 + proximity * 0.26;
        const opacity = 0.74 + proximity * 0.26;
        const shadowOpacity = 0.62 + proximity * 0.38;
        const shadowSpread = 50 + proximity * 34;

        cardNode.style.transform = `translate3d(0, ${lift}px, 0) scale(${scale.toFixed(3)})`;
        cardNode.style.filter = `brightness(${brightness.toFixed(3)}) saturate(${saturation.toFixed(3)})`;
        cardNode.style.opacity = opacity.toFixed(3);
        cardNode.style.boxShadow = `0 ${Math.round(18 + proximity * 13)}px ${Math.round(shadowSpread)}px -24px rgba(0,0,0,${shadowOpacity.toFixed(3)})`;
        // Keep the card always above the ranking number, even during scroll animation.
        cardNode.style.zIndex = String(20 + Math.round(proximity * 100));

        if (rankNode) {
          const rankScale = 0.9 + proximity * 0.13;
          const rankLift = -Math.round(proximity * 5);
          const rankOpacity = 0.72 + proximity * 0.28;
          const rankStrokeAlpha = 0.72 + proximity * 0.28;

          rankNode.style.transform = `translate3d(0, ${rankLift}px, 0) scale(${rankScale.toFixed(3)})`;
          rankNode.style.opacity = rankOpacity.toFixed(3);
          rankNode.style.filter = `drop-shadow(0 ${Math.round(5 + proximity * 7)}px ${Math.round(12 + proximity * 14)}px rgba(0,0,0,${(0.35 + proximity * 0.45).toFixed(3)}))`;
          rankNode.style.setProperty(
            "-webkit-text-stroke",
            `${(1.15 + proximity * 0.55).toFixed(2)}px rgba(255,255,255,${rankStrokeAlpha.toFixed(3)})`
          );
        }
      }
    };

    const scheduleUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      rafId = window.requestAnimationFrame(applyFocusEffect);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      for (const node of landingEventRefs.current.values()) {
        const cardNode = node.firstElementChild as HTMLElement | null;
        const rankNode = node.querySelector(".landing-trending-rank") as HTMLElement | null;
        if (!cardNode) continue;
        cardNode.style.transform = "";
        cardNode.style.filter = "";
        cardNode.style.opacity = "";
        cardNode.style.boxShadow = "";
        cardNode.style.zIndex = "";
        if (rankNode) {
          rankNode.style.transform = "";
          rankNode.style.opacity = "";
          rankNode.style.filter = "";
          rankNode.style.setProperty("-webkit-text-stroke", "");
        }
      }
    };
  }, [showLanding, landingHasEvents, landingTrendingEvents]);

  useEffect(() => {
    if (showLanding) {
      fetchLandingFeed();
    }
  }, [showLanding, fetchLandingFeed]);

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
        <Header showCategoryStrip={false} />
        <main id="main-content" className="relative mx-auto px-4 pt-0 pb-4 sm:px-6 sm:pt-0 sm:pb-6 md:pb-8 lg:pb-10 max-w-5xl">
          <section
            className="landing-hero-section landing-hero-section--prelogin relative left-1/2 w-screen -translate-x-1/2 overflow-hidden flex flex-col"
          >
            <div className="landing-prelogin-photo-bg" aria-hidden>
              <div className="landing-prelogin-photo-bg__image" />
              <div className="landing-prelogin-photo-bg__overlay" />
            </div>
            <div className="landing-hero-card relative z-10 flex flex-1 min-h-0 items-end justify-center px-4 pb-[clamp(86px,16vh,168px)] sm:pb-[clamp(96px,14vh,188px)]">
              <div className="w-full max-w-[19rem] mx-auto flex flex-col gap-3" aria-label="Azioni accesso">
                <Link
                  href="/auth/login"
                  className="inline-flex w-full min-h-[54px] items-center justify-center rounded-[16px] border border-cyan-200/40 bg-gradient-to-b from-[#7EFAFF] via-[#51DCE8] to-[#39C6D5] text-[#03111C] font-extrabold text-[16px] tracking-[0.02em] transition-all duration-250 hover:brightness-110 hover:-translate-y-[1px] hover:shadow-[0_14px_34px_-14px_rgba(103,243,255,0.95)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#031126]"
                >
                  Accedi
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex w-full min-h-[54px] items-center justify-center rounded-[16px] border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.14)_100%)] text-white font-bold text-[16px] tracking-[0.02em] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-all duration-250 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.33)_0%,rgba(255,255,255,0.16)_100%)] hover:-translate-y-[1px] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#031126]"
                >
                  Registrati
                </Link>
              </div>
            </div>
          </section>

          <section
            className="landing-trending-section relative left-1/2 w-screen -translate-x-1/2 mb-8 md:mb-10"
            aria-label="Mercati in tendenza"
          >
            <div className="px-4 sm:px-6">
              <h2 className="font-kalshi text-[1.55rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.1rem] font-bold text-white/95 leading-[1.1] tracking-[0.01em] mb-3 sm:mb-4">
                Trending now
              </h2>
            </div>
            {homeFeedLoading ? (
              <LoadingBlock message="Caricamento mercati in tendenza..." fullscreen={false} />
            ) : !landingHasEvents ? (
              <p className="text-ds-body-sm text-white/70 py-3 px-4 sm:px-6">Nessun mercato disponibile al momento.</p>
            ) : (
              <div className="landing-trending-row-wrap">
                <div className="landing-trending-row" role="list" aria-label="Mercati in tendenza">
                  {landingTrendingEvents.map((event, idx) => (
                    <div
                      key={event.id}
                      ref={(node) => setLandingEventRef(event.id, node)}
                      className={`landing-trending-row__item landing-trending-row__item--ranked ${
                        idx + 1 >= 10
                          ? "landing-trending-row__item--double"
                          : "landing-trending-row__item--single"
                      }`}
                      role="listitem"
                    >
                      <LandingTrendingMarketCard
                        id={event.id}
                        title={event.title}
                        category={event.category}
                        imageUrl={event.aiImageUrl}
                        onNavigate={handleEventClick}
                      />
                      <span className="landing-trending-rank" aria-hidden>
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header />
      <main id="main-content" className="mx-auto px-page-x pt-0 pb-page-y md:pt-0 md:pb-8 max-w-6xl">
        {/* Debug panel: only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true. */}
        {debugMode && (
          <div className="text-ds-micro text-fg-muted mb-2 p-2 rounded bg-white/5" aria-hidden>
            <p>debug: commit={debugInfo?.version?.commit ?? "—"} env={debugInfo?.version?.env ?? "—"} baseUrl={debugInfo?.version?.baseUrl ? `${debugInfo.version.baseUrl.slice(0, 40)}…` : "—"}</p>
            <p>dbConnected={String(debugInfo?.health?.dbConnected ?? "—")}</p>
          </div>
        )}

        <div className="pt-0 px-2 sm:px-4 max-w-6xl mx-auto">
          <HomeUnifiedFeed onEventNavigate={handleEventClick} />
        </div>

      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
