"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDisplayTitle } from "@/lib/debug-display";
import Header from "@/components/Header";
import PredictionModal from "@/components/PredictionModal";
import CommentsSection from "@/components/CommentsSection";
import EventProbabilityChart from "@/components/events/EventProbabilityChart";
import { trackView } from "@/lib/analytics-client";
import { getCategoryIcon } from "@/lib/category-icons";
import { IconCurrency } from "@/components/ui/Icons";
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
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [predictionOutcome, setPredictionOutcome] = useState<"YES" | "NO" | null>(null);
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

  useEffect(() => {
    if (!showResolutionPopup) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowResolutionPopup(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showResolutionPopup]);

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

  if (loading) {
    return (
      <div className="event-detail-page-immersive">
        <div className="event-detail-page-backdrop" aria-hidden />
        <Header />
        <main id="main-content" className="event-detail-page-main mx-auto px-4 py-8 max-w-2xl">
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
      <div className="event-detail-page-immersive">
        <div className="event-detail-page-backdrop" aria-hidden />
        <Header />
        <main id="main-content" className="event-detail-page-main mx-auto px-4 py-8 max-w-2xl">
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

  const backdropClass =
    event.category === "Economia"
      ? "event-detail-page-backdrop event-detail-page-backdrop--economia"
      : "event-detail-page-backdrop event-detail-page-backdrop--default";

  return (
    <div className="event-detail-page-immersive">
      <div className={backdropClass} aria-hidden />
      <Header />
      <main id="main-content" ref={mainRef} className="event-detail-page-main mx-auto px-3 py-4 md:px-4 md:py-8 max-w-2xl pb-8 md:pb-24">
        {/* Top line: Indietro (left) | Segui + Condividi (right) - outside box */}
        <div className="event-detail-toolbar flex items-center justify-between gap-2 mb-3 flex-wrap text-slate-200">
          <BackLink
            href="/"
            className="inline-flex items-center min-h-[40px] text-slate-200 hover:text-white rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <svg className="w-5 h-5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm">Indietro</span>
          </BackLink>
          <div className="flex items-center gap-1.5">
            {session && (
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`event-toolbar-btn min-h-[32px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors border border-white/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
                  isFollowing
                    ? "bg-primary/20 text-primary border-primary/40 hover:bg-primary/30"
                    : "bg-transparent text-slate-200 hover:text-white"
                }`}
              >
                {followLoading ? "..." : isFollowing ? "Non seguire" : "Segui"}
              </button>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="event-toolbar-btn min-h-[32px] px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-transparent text-slate-200 border border-white/20 hover:text-white transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              aria-label="Condividi"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shareCopied ? "Copiato!" : "Condividi"}
            </button>
          </div>
        </div>

        <article className="event-detail-box event-detail-box-neon event-detail-box-compact transition-all duration-ds-normal p-3 md:p-5 mb-4">
          {/* Header: categoria (sinistra) + solo numero crediti / Risolto (destra) */}
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 shrink-0 min-w-0 px-2 py-1 rounded-lg text-ds-caption font-semibold bg-white/5 border border-white/10 text-fg backdrop-blur-sm">
              <span className="text-primary shrink-0 [&>svg]:w-3.5 [&>svg]:h-3.5">
                {getCategoryIcon(event.category)}
              </span>
              <span className="truncate">{event.category}</span>
            </span>
            {event.resolved ? (
              <span className={`shrink-0 px-2 py-1 rounded-lg text-ds-caption font-semibold border ${event.outcome === "YES" ? "bg-success-bg/90 text-success border-success/30 dark:bg-success-bg/50 dark:border-success/40" : "bg-danger-bg/90 text-danger border-danger/30 dark:bg-danger-bg/50 dark:border-danger/40"}`}>
                Risolto: {event.outcome === "YES" ? "SÌ" : "NO"}
              </span>
            ) : session ? (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-ds-caption font-bold font-numeric text-fg bg-black/40 border border-white/20 text-white">
                <IconCurrency className="w-3.5 h-3.5 text-primary" aria-hidden />
                {userCredits.toLocaleString("it-IT")}
              </span>
            ) : null}
          </div>

          <h1 className="text-ds-h2 font-bold text-fg mb-1 leading-snug tracking-title text-lg md:text-xl">
            {getDisplayTitle(event.title, debugMode)}
          </h1>

          {event.description && (
            <p className="event-detail-description text-ds-body-sm text-fg-muted mb-2 leading-snug line-clamp-2 md:line-clamp-none md:mb-3">{event.description}</p>
          )}

          {/* Tabella 1x2: SI | NO (click per prevedere) */}
          {(() => {
            const qYes = event.q_yes ?? 0;
            const qNo = event.q_no ?? 0;
            const b = event.b ?? 100;
            const displayProbability = getEventProbability(event);
            const yesPct = getPrice(qYes, qNo, b, "YES") * 100;
            return (
              <>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (canMakePrediction) {
                        setPredictionOutcome("YES");
                        setShowPredictionModal(true);
                      }
                    }}
                    disabled={!canMakePrediction}
                    className="min-h-[44px] py-3 rounded-xl font-bold text-base transition-all flex flex-col items-center justify-center gap-0.5 prediction-bar-fill-si border-2 border-transparent hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    aria-label="Prevedi SÌ"
                  >
                    <span className="text-white drop-shadow-sm">SÌ</span>
                    <span className="text-ds-caption text-white/90 font-numeric tabular-nums">{displayProbability.toFixed(1)}%</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (canMakePrediction) {
                        setPredictionOutcome("NO");
                        setShowPredictionModal(true);
                      }
                    }}
                    disabled={!canMakePrediction}
                    className="min-h-[44px] py-3 rounded-xl font-bold text-base transition-all flex flex-col items-center justify-center gap-0.5 prediction-bar-fill-no border-2 border-transparent hover:border-primary/50 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    aria-label="Prevedi NO"
                  >
                    <span className="text-white drop-shadow-sm">NO</span>
                    <span className="text-ds-caption text-white/90 font-numeric tabular-nums">{(100 - displayProbability).toFixed(1)}%</span>
                  </button>
                </div>

                {/* Barra indicatore SI/NO */}
                <div className="mb-2">
                  <div className="flex justify-between text-ds-caption font-medium text-fg-muted mb-1">
                    <span>SÌ {(event.q_yes ?? 0).toLocaleString()} ({event.yesPredictions})</span>
                    <span>NO {(event.q_no ?? 0).toLocaleString()} ({event.noPredictions})</span>
                  </div>
                  <div
                    className="prediction-bar-led h-2.5 w-full flex animate-bar-pulse"
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

                {/* Hai previsto per X crediti (sempre) */}
                <div className="flex items-center justify-center gap-2 py-2 mb-3">
                  <span className="text-ds-body-sm text-fg-muted">Hai previsto per</span>
                  <span className="font-bold text-fg font-numeric tabular-nums">{(userPrediction?.credits ?? 0).toLocaleString("it-IT")}</span>
                  <span className="text-ds-body-sm text-fg-muted">crediti</span>
                  <IconCurrency className="w-5 h-5 text-primary shrink-0" aria-hidden />
                </div>
              </>
            );
          })()}

          <div className="mb-3 event-detail-chart-wrap">
            <EventProbabilityChart eventId={event.id} range="7d" refetchTrigger={event._count.predictions} />
          </div>

          {event.resolved && (
            <div className="box-raised p-3 mb-3">
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
            <div className="p-3 rounded-xl mb-3 border border-warning/30 bg-warning-bg/90 text-warning dark:bg-warning-bg/50 dark:text-warning text-ds-body-sm font-medium">
              Previsioni chiuse. Risultato: in attesa.
            </div>
          )}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <div className="p-3 bg-warning-bg/90 border border-warning/30 rounded-xl text-ds-body-sm text-warning dark:bg-warning-bg/50 dark:text-warning mb-3">
              <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per scommettere
            </div>
          )}

          <CommentsSection eventId={event.id} variant="embedded" />

          {/* Criterio di risoluzione e scadenza: in fondo, prima riga + Vedi tutto -> popup */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowResolutionPopup(true)}
              className="text-left w-full rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-ds-normal hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <h3 className="text-ds-body-sm font-semibold text-fg mb-0.5">Criterio di risoluzione e scadenza</h3>
              {event.resolutionNotes ? (
                <p className="text-ds-body-sm text-fg-muted line-clamp-1">{event.resolutionNotes.split("\n")[0]}</p>
              ) : (
                <p className="text-ds-body-sm text-fg-muted">Clicca per dettagli e scadenza</p>
              )}
              <span className="mt-2 inline-block text-ds-body-sm text-primary font-medium">Vedi tutto</span>
            </button>
          </div>
        </article>
      </main>

      {/* Popup Criterio di risoluzione e scadenza */}
      {showResolutionPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-popup-title"
          onClick={() => setShowResolutionPopup(false)}
        >
          <div
            className="bg-bg border border-white/20 rounded-2xl shadow-overlay max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 id="resolution-popup-title" className="text-ds-h3 font-bold text-fg">Criterio di risoluzione e scadenza</h2>
              <button
                type="button"
                onClick={() => setShowResolutionPopup(false)}
                className="p-2.5 rounded-xl text-fg-muted hover:text-fg hover:bg-surface/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Chiudi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {event.resolutionNotes && (
              <p className="text-ds-body-sm text-fg-muted whitespace-pre-wrap mb-4">{event.resolutionNotes}</p>
            )}
            {event.resolutionSourceUrl && (
              <p className="text-ds-body-sm text-fg mb-4">
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
            <div className="text-ds-body-sm text-fg-muted pt-4 border-t border-white/10 space-y-1">
              <p>Creato da {event.createdBy.name || "Utente"} · {new Date(event.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p>Chiusura: {new Date(event.closesAt).toLocaleDateString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        </div>
      )}

      {showPredictionModal && (
        <PredictionModal
          eventId={event.id}
          eventTitle={getDisplayTitle(event.title, debugMode)}
          isOpen={showPredictionModal}
          onClose={() => {
            setShowPredictionModal(false);
            setPredictionOutcome(null);
          }}
          onSuccess={handlePredictionSuccess}
          userCredits={userCredits}
          initialOutcome={predictionOutcome}
        />
      )}
    </div>
  );
}
