"use client";

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import OnboardingTour from "@/components/OnboardingTour";
import { FootballHomepage } from "@/components/home/football/FootballHomepage";
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
        <Header showCategoryStrip={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingBlock message="" />
        </div>
      </div>
    );
  }

  if (showLanding) {
    return (
      <div className="lp-root landing-page">
        <Header showCategoryStrip={false} />

        {/* ══════════════════════════════════════════════════════════════
            HERO — full viewport, cinematic, maximum conversion
        ══════════════════════════════════════════════════════════════ */}
        <section className="lp-hero">
          {/* Cinematic photo bg (reuses existing system) */}
          <div className="landing-prelogin-photo-bg" aria-hidden>
            <div className="landing-prelogin-photo-bg__image" />
            <div className="landing-prelogin-photo-bg__overlay" />
          </div>
          {/* Animated ambient orbs */}
          <div className="lp-orbs" aria-hidden>
            <div className="lp-orb lp-orb--a" />
            <div className="lp-orb lp-orb--b" />
            <div className="lp-orb lp-orb--c" />
          </div>

          <div className="lp-hero-body">
            {/* Live pill */}
            <div className="lp-hero-live">
              <span className="landing-live-dot" aria-hidden />
              <span>
                {landingTrendingEvents.length > 0
                  ? `${landingTrendingEvents.length} mercati attivi ora`
                  : "Mercati attivi ora"}
              </span>
            </div>

            {/* Main headline */}
            <h1 className="lp-hero-headline">
              <span className="lp-hero-hl-white">Prevedi il futuro.</span>
              <span className="lp-hero-hl-cyan">Vinci sui mercati.</span>
            </h1>

            {/* Sub-headline */}
            <p className="lp-hero-sub">
              Il primo prediction market sportivo italiano.{" "}
              <br className="lp-br" />
              Prevedi gli eventi, sfida gli altri, scala le classifiche.
            </p>

            {/* ── AUTO-SLIDING EVENT CARDS ── */}
            {(landingHasEvents || homeFeedLoading) && (
              <div className="lp-marquee" aria-label="Mercati in evidenza">
                <div className="lp-marquee__fade lp-marquee__fade--l" aria-hidden />
                <div className="lp-marquee__fade lp-marquee__fade--r" aria-hidden />
                <div
                  className="lp-marquee__track"
                  style={homeFeedLoading ? { animationPlayState: "paused" } : undefined}
                  aria-hidden
                >
                  {[...landingTrendingEvents, ...landingTrendingEvents].map((ev, i) => (
                    <div key={`mq-${ev.id}-${i}`} className="lp-mq-card">
                      {ev.aiImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.aiImageUrl}
                          alt=""
                          className="lp-mq-card__img"
                          loading="lazy"
                        />
                      )}
                      <div className="lp-mq-card__overlay" />
                      <div className="lp-mq-card__body">
                        <span className="lp-mq-card__cat">{ev.category}</span>
                        <p className="lp-mq-card__title">{ev.title}</p>
                        <div className="lp-mq-card__probs">
                          <div className="lp-mq-card__prob lp-mq-card__prob--yes">
                            <span>SÌ</span>
                            <span className="lp-mq-card__pct">{Math.round(ev.yesPct)}%</span>
                          </div>
                          <div className="lp-mq-card__prob lp-mq-card__prob--no">
                            <span>NO</span>
                            <span className="lp-mq-card__pct">{Math.round(100 - ev.yesPct)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats bar */}
            <div className="lp-stats">
              <div className="lp-stat">
                <span className="lp-stat__num">10k+</span>
                <span className="lp-stat__lbl">Predittori</span>
              </div>
              <div className="lp-stat__sep" />
              <div className="lp-stat">
                <span className="lp-stat__num">500+</span>
                <span className="lp-stat__lbl">Mercati</span>
              </div>
              <div className="lp-stat__sep" />
              <div className="lp-stat">
                <span className="lp-stat__num">#1</span>
                <span className="lp-stat__lbl">In Italia</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="lp-cta-group">
              <Link
                href="/auth/signup"
                className="lp-cta-primary"
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.boxShadow =
                    "0 0 60px rgba(56,228,238,0.5), 0 14px 44px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.32)";
                  el.style.transform = "translateY(-2px) scale(1.012)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.boxShadow = "";
                  el.style.transform = "";
                }}
              >
                <span>Inizia ora — è gratis</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/auth/login" className="lp-cta-secondary">
                Ho già un account · Accedi
              </Link>
            </div>

            {/* Trust micro-copy */}
            <p className="lp-trust">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                style={{ display: "inline", verticalAlign: "middle", marginRight: 5, opacity: 0.45 }}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Nessuna carta di credito · Solo previsioni, nessuna scommessa
            </p>
          </div>

          <div className="lp-hero-bottom-fade" aria-hidden />
        </section>

        {/* ══════════════════════════════════════════════════════════════
            HOW IT WORKS — 3 passi chiari e visivi
        ══════════════════════════════════════════════════════════════ */}
        <section className="lp-steps-section" aria-label="Come funziona">
          <div className="lp-section-wrap">
            <p className="lp-section-eyebrow">Come funziona</p>
            <h2 className="lp-section-title">3 passi verso la vittoria</h2>
            <div className="lp-steps">
              <div className="lp-step">
                <div className="lp-step__num-badge">01</div>
                <div className="lp-step__icon-wrap lp-step__icon-wrap--1">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <h3 className="lp-step__title">Prevedi</h3>
                <p className="lp-step__desc">Scegli un mercato sportivo e prevedi il risultato. Usa la tua conoscenza per battere la media.</p>
              </div>
              <div className="lp-step-connector" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(56,228,238,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="lp-step">
                <div className="lp-step__num-badge">02</div>
                <div className="lp-step__icon-wrap lp-step__icon-wrap--2">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="lp-step__title">Sfida</h3>
                <p className="lp-step__desc">Entra nelle classifiche globali e misura il tuo talento contro migliaia di predittori italiani.</p>
              </div>
              <div className="lp-step-connector" aria-hidden>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(56,228,238,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="lp-step">
                <div className="lp-step__num-badge">03</div>
                <div className="lp-step__icon-wrap lp-step__icon-wrap--3">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                <h3 className="lp-step__title">Vinci</h3>
                <p className="lp-step__desc">Previsioni giuste = punti, premi e riconoscimenti esclusivi. I migliori scalano verso la vetta.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            TRENDING MARKETS — mercati live
        ══════════════════════════════════════════════════════════════ */}
        <section
          className="lp-trending-section landing-trending-section"
          aria-label="Mercati in tendenza"
        >
          <div className="lp-trending-header px-4 sm:px-6">
            <div>
              <p className="lp-section-eyebrow lp-section-eyebrow--live">
                <span className="landing-live-dot" aria-hidden />
                Live ora
              </p>
              <h2 className="lp-section-title lp-section-title--trending">Trending now</h2>
            </div>
            <Link href="/auth/signup" className="lp-trending-see-all">
              Vedi tutti
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
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

        {/* ══════════════════════════════════════════════════════════════
            FEATURES — perché sceglierci
        ══════════════════════════════════════════════════════════════ */}
        <section className="lp-features-section" aria-label="Caratteristiche principali">
          <div className="lp-section-wrap">
            <p className="lp-section-eyebrow">Perché scegliere noi</p>
            <h2 className="lp-section-title">La piattaforma che cambia tutto</h2>
            <div className="lp-features">
              <div className="lp-feature">
                <div className="lp-feature__icon-wrap lp-feature__icon-wrap--1">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <h3 className="lp-feature__title">Mercati in tempo reale</h3>
                <p className="lp-feature__desc">Le probabilità si aggiornano in diretta con le previsioni di tutta la community. Nessun ritardo, tutto live.</p>
              </div>
              <div className="lp-feature">
                <div className="lp-feature__icon-wrap lp-feature__icon-wrap--2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="lp-feature__title">AI-Powered</h3>
                <p className="lp-feature__desc">Immagini, analisi e insight generati dall&apos;intelligenza artificiale per ogni evento. Il futuro è già qui.</p>
              </div>
              <div className="lp-feature">
                <div className="lp-feature__icon-wrap lp-feature__icon-wrap--3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="lp-feature__title">Premi esclusivi</h3>
                <p className="lp-feature__desc">I predittori migliori guadagnano premi esclusivi e badge legati ai campioni dello sport.</p>
              </div>
              <div className="lp-feature">
                <div className="lp-feature__icon-wrap lp-feature__icon-wrap--4">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <h3 className="lp-feature__title">Classifiche globali</h3>
                <p className="lp-feature__desc">Scala la classifica globale, guadagna punti esperienza e dimostra chi sei davvero nell&apos;arena italiana.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            FINAL CTA — conversione massima
        ══════════════════════════════════════════════════════════════ */}
        <section className="lp-final-cta" aria-label="Registrati ora">
          <div className="lp-final-cta__orb" aria-hidden />
          <div className="lp-section-wrap lp-final-cta__inner">
            <p className="lp-section-eyebrow lp-section-eyebrow--light">Entra nell&apos;elite</p>
            <h2 className="lp-final-cta__title">
              Pronto a dimostrare<br />il tuo talento?
            </h2>
            <p className="lp-final-cta__sub">
              Unisciti a 10.000+ predittori. Gratis, senza carta di credito, in 30 secondi.
            </p>
            <Link
              href="/auth/signup"
              className="lp-cta-primary lp-cta-primary--lg"
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow =
                  "0 0 60px rgba(56,228,238,0.5), 0 14px 44px -10px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.32)";
                el.style.transform = "translateY(-2px) scale(1.012)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.boxShadow = "";
                el.style.transform = "";
              }}
            >
              <span>Crea il tuo account gratis</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/auth/login" className="lp-cta-secondary lp-cta-secondary--sm">
              Ho già un account · Accedi
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {showOnboarding && (
        <OnboardingTour onComplete={handleOnboardingComplete} />
      )}
      <Header showCategoryStrip={false} />
      <main id="main-content" className="mx-auto px-page-x pt-0 pb-page-y md:pt-0 md:pb-8 max-w-6xl">
        {/* Debug panel: only when ?debug=1 or NEXT_PUBLIC_DEBUG_MODE=true. */}
        {debugMode && (
          <div className="text-ds-micro text-fg-muted mb-2 p-2 rounded bg-white/5" aria-hidden>
            <p>debug: commit={debugInfo?.version?.commit ?? "—"} env={debugInfo?.version?.env ?? "—"} baseUrl={debugInfo?.version?.baseUrl ? `${debugInfo.version.baseUrl.slice(0, 40)}…` : "—"}</p>
            <p>dbConnected={String(debugInfo?.health?.dbConnected ?? "—")}</p>
          </div>
        )}

        <div className="pt-0 px-2 sm:px-4 max-w-6xl mx-auto">
          <FootballHomepage
            isLoggedIn={status === "authenticated"}
            onEventNavigate={handleEventClick}
          />
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
