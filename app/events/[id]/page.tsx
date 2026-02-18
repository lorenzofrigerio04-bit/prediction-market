"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDisplayTitle } from "@/lib/debug-display";
import Header from "@/components/Header";
import PredictionModal from "@/components/PredictionModal";
import CommentsSection from "@/components/CommentsSection";
import { trackView } from "@/lib/analytics-client";
import { getCategoryIcon } from "@/lib/category-icons";
import { IconClock, IconCurrency } from "@/components/ui/Icons";
import BackLink from "@/components/ui/BackLink";
import { getEventProbability } from "@/lib/pricing/price-display";
import { getPrice, cost } from "@/lib/pricing/lmsr";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  outcome: "YES" | "NO" | null;
  resolutionSourceUrl: string | null;
  resolutionNotes: string | null;
  probability: number;
  totalCredits: number;
  yesCredits: number;
  noCredits: number;
  /** LMSR: quantity of YES shares (use for bar/price when present) */
  q_yes?: number | null;
  /** LMSR: quantity of NO shares */
  q_no?: number | null;
  /** LMSR: liquidity parameter */
  b?: number | null;
  yesPredictions: number;
  noPredictions: number;
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

interface UserPrediction {
  id: string;
  outcome: "YES" | "NO";
  credits: number;
  resolved: boolean;
  won: boolean | null;
  payout: number | null;
}

interface EventResponse {
  event: EventDetail;
  userPrediction: UserPrediction | null;
  isFollowing?: boolean;
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debugMode =
    searchParams.get("debug") === "1" ||
    (typeof process.env.NEXT_PUBLIC_DEBUG_MODE !== "undefined" &&
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userPrediction, setUserPrediction] = useState<UserPrediction | null>(
    null
  );
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);

  const canMakePrediction =
    !!event &&
    !event.resolved &&
    new Date(event.closesAt) > new Date() &&
    !userPrediction &&
    !!session;

  useEffect(() => {
    if (params?.id) {
      fetchEvent();
      if (session?.user?.id) {
        fetchUserCredits();
      }
    }
  }, [params?.id, session]);

  useEffect(() => {
    if (!event) return;
    trackView("EVENT_VIEWED", { eventId: event.id, category: event.category });
    if (event.resolved) {
      trackView("EVENT_RESOLVED_VIEWED", { eventId: event.id });
    }
  }, [event?.id, event?.resolved, event?.category]);

  const fetchEvent = async () => {
    if (!params?.id) return;
    try {
      const response = await fetch(`/api/events/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/");
          }
          return;
        }
        throw new Error("Failed to fetch event");
      }

      const data: EventResponse = await response.json();
      setEvent(data.event);
      setUserPrediction(data.userPrediction);
      setIsFollowing(data.isFollowing ?? false);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      // We'll need to create an API route for this, but for now we can get it from the session
      // For now, we'll fetch it from a user API endpoint if it exists
      const response = await fetch("/api/user/credits");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.credits || 0);
      }
    } catch (error) {
      console.error("Error fetching user credits:", error);
    }
  };

  const handlePredictionSuccess = () => {
    fetchEvent();
    if (session?.user?.id) {
      fetchUserCredits();
    }
  };

  const handleFollowToggle = async () => {
    if (!session?.user?.id || !event) return;
    setFollowLoading(true);
    try {
      const response = await fetch(`/api/events/${event.id}/follow`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Errore");
      setIsFollowing(data.isFollowing);
    } catch (e) {
      console.error(e);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/events/${event?.id}` : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: getDisplayTitle(event?.title ?? "Evento", debugMode),
          url,
          text: getDisplayTitle(event?.title ?? "", debugMode),
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(url);
          setShareCopied(true);
          setTimeout(() => setShareCopied(false), 2000);
        } catch {
          // ignore
        }
      }
    }
  };

  const getTimeRemaining = () => {
    if (!event) return "";
    const timeUntilClose = new Date(event.closesAt).getTime() - Date.now();
    const hoursUntilClose = Math.floor(timeUntilClose / (1000 * 60 * 60));
    const daysUntilClose = Math.floor(hoursUntilClose / 24);

    if (timeUntilClose <= 0) {
      return "Chiuso";
    }
    if (daysUntilClose > 0) {
      return `${daysUntilClose}g ${hoursUntilClose % 24}h`;
    }
    if (hoursUntilClose > 0) {
      return `${hoursUntilClose} ore`;
    }
    const minutesUntilClose = Math.floor(timeUntilClose / (1000 * 60));
    return minutesUntilClose > 0 ? `${minutesUntilClose} min` : "Presto";
  };

  const stickyCtaObserverRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    if (!canMakePrediction) return;
    const id = requestAnimationFrame(() => {
      const main = mainRef.current;
      if (!main) return;
      const cta = main.querySelector("[data-event-detail-cta]");
      if (!cta) return;
      stickyCtaObserverRef.current = new IntersectionObserver(
        ([e]) => setShowStickyCta(!e.isIntersecting),
        { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
      );
      stickyCtaObserverRef.current.observe(cta);
    });
    return () => {
      cancelAnimationFrame(id);
      stickyCtaObserverRef.current?.disconnect();
      stickyCtaObserverRef.current = null;
    };
  }, [event?.id, canMakePrediction]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-fg-muted font-medium">Caricamento evento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center py-12">
            <p className="text-fg-muted text-lg">Evento non trovato</p>
            <BackLink
              href="/"
              className="mt-4 text-primary hover:text-primary-hover font-semibold inline-block focus-visible:underline"
            >
              Indietro
            </BackLink>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main ref={mainRef} className="mx-auto px-4 py-5 md:py-8 max-w-2xl pb-8 md:pb-24">
        <BackLink
          href="/"
          className="inline-flex items-center min-h-[44px] text-text-muted hover:text-fg mb-4 rounded-2xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <svg className="w-5 h-5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Indietro</span>
        </BackLink>

        <article className="card-neon-glass transition-all duration-ds-normal p-5 md:p-6 mb-6">
          {/* Header: categoria + scadenza (solo in alto) */}
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 shrink-0 min-w-0 px-2.5 py-1.5 rounded-xl text-ds-caption font-semibold bg-white/5 border border-white/10 text-fg backdrop-blur-sm">
              <span className="text-primary shrink-0 [&>svg]:w-4 [&>svg]:h-4">
                {getCategoryIcon(event.category)}
              </span>
              <span className="truncate">{event.category}</span>
            </span>
            {event.resolved ? (
              <span className={`shrink-0 px-2.5 py-1.5 rounded-xl text-ds-caption font-semibold border ${event.outcome === "YES" ? "bg-success-bg/90 text-success border-success/30 dark:bg-success-bg/50 dark:border-success/40" : "bg-danger-bg/90 text-danger border-danger/30 dark:bg-danger-bg/50 dark:border-danger/40"}`}>
                Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-ds-caption font-bold font-numeric text-fg bg-black/40 border border-primary/50 text-white shadow-[0_0_14px_-2px_rgba(var(--primary-glow),0.4)]">
                <IconClock className="w-4 h-4 text-primary" aria-hidden />
                {new Date(event.closesAt) <= new Date() ? "Chiuso" : `Chiude tra ${getTimeRemaining()}`}
              </span>
            )}
          </div>

          <h1 className="text-ds-h2 font-bold text-fg mb-2 leading-snug tracking-title">
            {getDisplayTitle(event.title, debugMode)}
          </h1>
          <p className="text-ds-body-sm text-fg-muted mb-4">Scegli SI o NO e la quantità di crediti.</p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {session && (
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-ds-body-sm font-semibold transition-colors border focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  isFollowing
                    ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30"
                    : "glass text-fg-muted border-border dark:border-white/10 hover:text-fg hover:bg-surface/50"
                }`}
              >
                {followLoading ? "..." : isFollowing ? "Non seguire più" : "Segui evento"}
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="min-h-[44px] px-4 py-2 rounded-2xl text-ds-body-sm font-semibold glass text-fg-muted border border-border dark:border-white/10 hover:text-fg hover:bg-surface/50 transition-colors inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              aria-label="Condividi"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shareCopied ? "Link copiato!" : "Condividi"}
            </button>
          </div>

          {event.description && (
            <p className="text-ds-body-sm text-fg-muted mb-6 leading-relaxed">{event.description}</p>
          )}

          {/* Criteri di risoluzione */}
          {(event.resolutionNotes || event.resolutionSourceUrl) && (
            <div className="box-neon-soft p-4 mb-6">
              <h3 className="text-ds-body-sm font-semibold text-fg mb-2">Criteri di risoluzione</h3>
              {event.resolutionNotes && (
                <p className="text-ds-body-sm text-fg-muted whitespace-pre-wrap mb-2">{event.resolutionNotes}</p>
              )}
              {event.resolutionSourceUrl && (
                <p className="text-ds-body-sm text-fg">
                  Fonte di risoluzione:{" "}
                  <a
                    href={event.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline font-medium"
                  >
                    {event.resolutionSourceUrl.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Statistiche: sempre LMSR (q_yes, q_no, b) */}
          {(() => {
            const qYes = event.q_yes ?? 0;
            const qNo = event.q_no ?? 0;
            const b = event.b ?? 100;
            const displayProbability = getEventProbability(event);
            const yesPct = getPrice(qYes, qNo, b, "YES") * 100;
            const creditsInPlay = event.totalCredits > 0
              ? event.totalCredits
              : (qYes > 0 || qNo > 0 ? Math.round(cost(qYes, qNo, b)) : 0);
            return (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="stat-neon-mini flex flex-col items-center justify-center py-4 px-3 text-center">
                    <span className="text-xl md:text-2xl font-bold text-primary font-numeric tabular-nums drop-shadow-[0_0_12px_rgba(var(--primary-glow),0.5)]">{displayProbability.toFixed(1)}%</span>
                    <span className="text-ds-caption text-fg-muted font-semibold uppercase tracking-label mt-0.5">prevede SÌ</span>
                  </div>
                  <div className="stat-neon-mini flex flex-col items-center justify-center py-4 px-3 text-center">
                    <span className="text-xl md:text-2xl font-bold text-fg font-numeric tabular-nums">{event._count.predictions}</span>
                    <span className="text-ds-caption text-fg-muted font-semibold uppercase tracking-label mt-0.5">previsioni</span>
                  </div>
                </div>

                <div className="pill-credits-neon flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl mb-6">
                  <IconCurrency className="w-5 h-5 text-primary shrink-0" aria-hidden />
                  <span className="text-lg md:text-xl font-bold text-white font-numeric tabular-nums">
                    {creditsInPlay.toLocaleString("it-IT")} CREDITI IN GIOCO
                  </span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-ds-caption font-medium text-fg-muted mb-2">
                    <span>SÌ {(event.q_yes ?? 0).toLocaleString()} ({event.yesPredictions})</span>
                    <span>NO {(event.q_no ?? 0).toLocaleString()} ({event.noPredictions})</span>
                  </div>
                  <div
                    className="prediction-bar-led h-3 w-full flex animate-bar-pulse"
                    role="presentation"
                    aria-hidden
                  >
                    <div
                      className="prediction-bar-fill-si h-full shrink-0 transition-[width] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
                      style={{ width: `${yesPct}%` }}
                    />
                    <div
                      className="prediction-bar-fill-no h-full shrink-0 transition-[width] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
                      style={{ width: `${100 - yesPct}%` }}
                    />
                  </div>
                </div>
              </>
            );
          })()}

          {userPrediction && (
            <div className={`box-neon-soft p-4 mb-6 ${
              userPrediction.resolved
                ? userPrediction.won ? "border-success/40 shadow-[0_0_20px_-6px_rgba(74,222,128,0.2)]" : "border-danger/40 shadow-[0_0_20px_-6px_rgba(248,113,113,0.2)]"
                : "border-primary/30 shadow-[0_0_24px_-8px_rgba(var(--primary-glow),0.2)]"
            }`}>
              <h3 className="text-ds-body-sm font-semibold text-fg mb-1">La tua previsione</h3>
              <p className="text-ds-body-sm text-fg-muted">
                <span className="font-semibold text-primary">{userPrediction.outcome === "YES" ? "SÌ" : "NO"}</span>
                {" — "}
                <span className="font-semibold text-fg">{userPrediction.credits.toLocaleString()} crediti</span>
              </p>
              {userPrediction.resolved && (
                <p className={`text-ds-body-sm font-semibold mt-1 ${userPrediction.won ? "text-success" : "text-danger"}`}>
                  {userPrediction.won ? `✓ Vittoria: +${userPrediction.payout?.toLocaleString()} crediti` : "✗ Persa"}
                </p>
              )}
            </div>
          )}

          {event.resolved && (
            <div className="box-neon-soft p-4 mb-6">
              <p className="text-ds-body font-semibold text-fg">
                Previsioni chiuse. Risultato: {event.outcome === "YES" ? "SÌ" : "NO"}.
              </p>
              {event.resolutionSourceUrl && (
                <p className="text-ds-body-sm text-fg-muted mt-1">
                  Fonte:{" "}
                  <a
                    href={event.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline"
                  >
                    Vai alla fonte
                  </a>
                </p>
              )}
            </div>
          )}

          {!event.resolved && new Date(event.closesAt) <= new Date() && (
            <div className="p-4 rounded-2xl mb-6 border border-warning/30 bg-warning-bg/90 text-warning dark:bg-warning-bg/50 dark:text-warning text-ds-body-sm font-medium">
              Previsioni chiuse. Risultato: in attesa.
            </div>
          )}

          {canMakePrediction && (
            <button
              type="button"
              data-event-detail-cta
              onClick={() => setShowPredictionModal(true)}
              className="w-full min-h-[48px] py-3 rounded-xl font-semibold text-ds-body-sm text-white bg-primary hover:bg-primary-hover transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-bg border border-white/20 shadow-[0_0_28px_-6px_rgba(var(--primary-glow),0.5)] hover:shadow-[0_0_36px_-4px_rgba(var(--primary-glow),0.6)] hover:border-white/30"
            >
              Prevedi
            </button>
          )}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <div className="p-4 bg-warning-bg/90 border border-warning/30 rounded-2xl text-ds-body-sm text-warning dark:bg-warning-bg/50 dark:text-warning">
              <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per scommettere
            </div>
          )}

          <div className="text-ds-body-sm text-fg-muted mt-6 pt-4 border-t border-white/10 space-y-1">
            <p>Creato da {event.createdBy.name || "Utente"} · {new Date(event.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Chiusura: {new Date(event.closesAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </article>

        <CommentsSection eventId={event.id} />
      </main>

      {canMakePrediction && showStickyCta && (
        <div
          className="md:hidden fixed left-0 right-0 z-30 px-4 pt-3 pb-[calc(0.75rem+72px+var(--safe-area-inset-bottom))] bg-bg/95 backdrop-blur-md border-t border-white/10"
          style={{ paddingBottom: "calc(0.75rem + 72px + var(--safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={() => setShowPredictionModal(true)}
            className="w-full min-h-[48px] py-3 rounded-xl font-semibold text-ds-body-sm text-white bg-primary hover:bg-primary-hover border border-white/20 shadow-[0_0_28px_-6px_rgba(var(--primary-glow),0.5)]"
          >
            Prevedi
          </button>
        </div>
      )}

      {showPredictionModal && (
        <PredictionModal
          eventId={event.id}
          eventTitle={getDisplayTitle(event.title, debugMode)}
          isOpen={showPredictionModal}
          onClose={() => setShowPredictionModal(false)}
          onSuccess={handlePredictionSuccess}
          userCredits={userCredits}
        />
      )}
    </div>
  );
}
