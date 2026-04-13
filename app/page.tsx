"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import { HomeUnifiedFeed } from "@/components/home/HomeUnifiedFeed";
import LandingMarketsBackdropWall from "@/components/landing/LandingMarketsBackdropWall";
import LandingTrendingMarketCard from "@/components/landing/LandingTrendingMarketCard";
import { LoadingBlock } from "@/components/ui";
import { getDisplayTitle, isDebugTitle } from "@/lib/debug-display";
import { generateNotificationsOnDemand } from "@/lib/notifications/client";

const ONBOARDING_STORAGE_KEY = "prediction-market-onboarding-completed";

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

  const [homeFeedLoading, setHomeFeedLoading] = useState(false);
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
    setHomeFeedLoading(true);
    try {
      const res = await fetch("/api/feed/home-unified?limit=60", { cache: "no-store" });
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
    const onVisible = () => fetchLandingFeed();
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

    return (in24h.length > 0 ? in24h : deduped).slice(0, 50);
  }, [landingTop24hEvents, debugMode]);

  const landingHasEvents = landingTrendingEvents.length > 0;
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
        <main id="main-content" className="relative mx-auto px-4 py-4 sm:px-6 sm:py-6 md:py-8 lg:py-10 max-w-5xl">
          <section
            className="landing-hero-section relative left-1/2 w-screen -translate-x-1/2 overflow-hidden flex flex-col min-h-[100dvh]"
          >
            <LandingMarketsBackdropWall markets={landingTrendingEvents} />
            <div className="landing-hero-card relative z-10 flex flex-1 min-h-0" />
          </section>

          <section className="mb-8 md:mb-10 pt-6 md:pt-7" aria-label="Mercati in tendenza">
            <h2 className="landing-section-title landing-section-title--no-underline text-ds-h2 font-bold text-fg mb-3 sm:mb-4">
              <span className="landing-section-title__text">Trending now</span>
            </h2>
            {homeFeedLoading ? (
              <LoadingBlock message="Caricamento mercati in tendenza..." fullscreen={false} />
            ) : !landingHasEvents ? (
              <p className="text-ds-body-sm text-white/70 py-3">Nessun mercato disponibile al momento.</p>
            ) : (
              <div className="landing-trending-row-wrap">
                <div className="landing-trending-row" role="list" aria-label="Mercati in tendenza">
                  {landingTrendingEvents.map((event) => (
                    <div key={event.id} className="landing-trending-row__item" role="listitem">
                      <LandingTrendingMarketCard
                        id={event.id}
                        title={event.title}
                        category={event.category}
                        imageUrl={event.aiImageUrl}
                        onNavigate={handleEventClick}
                      />
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
