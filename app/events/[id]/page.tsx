"use client";

import { use, useState, useEffect, useRef } from "react";
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
  tradingMode?: string | null;
  q_yes?: number | null;
  q_no?: number | null;
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

interface UserPosition {
  yesShareMicros: string;
  noShareMicros: string;
  /** Crediti effettivamente spesi (costo) per questa posizione AMM */
  positionCostMicros?: string;
  /** Costo attribuito alle quote SÌ (per P&L vendita) */
  positionYesCostMicros?: string;
  /** Costo attribuito alle quote NO (per P&L vendita) */
  positionNoCostMicros?: string;
}

interface TradeHistoryEntry {
  id: string;
  side: string;
  outcome: string;
  shareMicros: string;
  costMicros: string;
  createdAt: string;
  /** Solo per SELL: P&L realizzato in micros (per mostrare +X% / -X%) */
  realizedPlMicros?: string | null;
}

interface EventResponse {
  event: EventDetail;
  userPosition?: UserPosition | null;
  tradeHistory?: TradeHistoryEntry[];
  isFollowing?: boolean;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams?.id ?? "";

  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debugMode =
    searchParams.get("debug") === "1" ||
    (typeof process.env.NEXT_PUBLIC_DEBUG_MODE !== "undefined" &&
      process.env.NEXT_PUBLIC_DEBUG_MODE === "true");
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [showDescriptionPopup, setShowDescriptionPopup] = useState(false);
  const [showSellInfoPopup, setShowSellInfoPopup] = useState(false);
  const [predictionOutcome, setPredictionOutcome] = useState<"YES" | "NO" | null>(null);
  const [sellOutcome, setSellOutcome] = useState<"YES" | "NO">("YES");
  const [sellShares, setSellShares] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellPreview, setSellPreview] = useState<{
    estimatedProceedsMicros: string | null;
    loading: boolean;
  }>({ estimatedProceedsMicros: null, loading: false });
  const [sellSuccessPl, setSellSuccessPl] = useState<number | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistoryEntry[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const [prevProbability, setPrevProbability] = useState<number | null>(null);
  const SCALE = 1_000_000;

  const canMakePrediction =
    !!event &&
    !event.resolved &&
    new Date(event.closesAt) > new Date() &&
    !!session;

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      if (session?.user?.id) {
        fetchUserCredits();
      }
    }
  }, [eventId, session]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && eventId) {
        fetchEvent();
        if (session?.user?.id) fetchUserCredits();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [eventId, session?.user?.id]);

  // Aggiornamento in tempo reale del conteggio previsioni e probabilità (polling quando tab visibile)
  const PREDICTION_COUNT_POLL_MS = 20_000;
  useEffect(() => {
    if (!eventId || !event) return;
    const poll = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchEvent();
      }
    };
    const id = setInterval(poll, PREDICTION_COUNT_POLL_MS);
    return () => clearInterval(id);
  }, [eventId, event?.id]);

  useEffect(() => {
    if (!event) return;
    trackView("EVENT_VIEWED", { eventId: event.id, category: event.category });
    if (event.resolved) {
      trackView("EVENT_RESOLVED_VIEWED", { eventId: event.id });
    }
  }, [event?.id, event?.resolved, event?.category]);

  useEffect(() => {
    if (!showResolutionPopup && !showDescriptionPopup && !showSellInfoPopup) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResolutionPopup(false);
        setShowDescriptionPopup(false);
        setShowSellInfoPopup(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showResolutionPopup, showDescriptionPopup, showSellInfoPopup]);

  useEffect(() => {
    if (event?.probability != null && typeof event.probability === "number") {
      setPrevProbability(event.probability);
    }
  }, [event?.probability]);

  useEffect(() => {
    if (!event?.id || !userPosition) {
      setSellPreview({ estimatedProceedsMicros: null, loading: false });
      return;
    }
    const num = parseFloat(sellShares);
    if (!Number.isFinite(num) || num <= 0) {
      setSellPreview({ estimatedProceedsMicros: null, loading: false });
      return;
    }
    const maxSell = sellOutcome === "YES"
      ? Number(BigInt(userPosition.yesShareMicros) / BigInt(SCALE))
      : Number(BigInt(userPosition.noShareMicros) / BigInt(SCALE));
    if (num > maxSell) {
      setSellPreview({ estimatedProceedsMicros: null, loading: false });
      return;
    }
    const shareMicros = BigInt(Math.round(num * SCALE));
    let cancelled = false;
    setSellPreview((p) => ({ ...p, loading: true }));
    fetch("/api/trades/sell/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        outcome: sellOutcome,
        shareMicros: shareMicros.toString(),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSellPreview({
          estimatedProceedsMicros: data.estimatedProceedsMicros ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (!cancelled) setSellPreview((p) => ({ ...p, loading: false }));
      });
    return () => { cancelled = true; };
  }, [event?.id, userPosition, sellOutcome, sellShares]);

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      const response = await fetch(`/api/events/${eventId}`, { cache: "no-store" });
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
      setUserPosition(data.userPosition ?? null);
      setTradeHistory(data.tradeHistory ?? []);
      setIsFollowing(data.isFollowing ?? false);
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch("/api/user/credits", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setUserCredits(typeof data.credits === "number" ? data.credits : 0);
      }
    } catch (error) {
      console.error("Error fetching user credits:", error);
    }
  };

  const handlePredictionSuccess = (outcome?: "YES" | "NO") => {
    if (outcome) setSellOutcome(outcome);
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

  const categoryToBackdrop: Record<string, string> = {
    Cultura: "event-detail-page-backdrop event-detail-page-backdrop--cultura",
    Economia: "event-detail-page-backdrop event-detail-page-backdrop--economia",
    Intrattenimento: "event-detail-page-backdrop event-detail-page-backdrop--intrattenimento",
    Sport: "event-detail-page-backdrop event-detail-page-backdrop--sport",
    Tecnologia: "event-detail-page-backdrop event-detail-page-backdrop--tecnologia",
    Scienza: "event-detail-page-backdrop event-detail-page-backdrop--scienza",
    Politica: "event-detail-page-backdrop event-detail-page-backdrop--politica",
  };
  const backdropClass =
    categoryToBackdrop[event.category] ??
    "event-detail-page-backdrop event-detail-page-backdrop--default";

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

        {/* Box 1: Evento + Commenti — compatto, spaziato, super leggibile */}
        <article className="event-detail-box event-detail-box-neon event-detail-box-event-comments transition-all duration-ds-normal p-4 md:p-5 mb-4">
          {/* Header: categoria (sinistra) + solo numero crediti / Risolto (destra) */}
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
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

          <div className="flex items-start gap-2 mb-3">
            <h1 className="text-ds-h2 font-bold text-fg leading-snug tracking-title text-base md:text-lg flex-1 min-w-0">
              {getDisplayTitle(event.title, debugMode)}
            </h1>
            <button
              type="button"
              onClick={() => setShowDescriptionPopup(true)}
              className="shrink-0 w-8 h-8 rounded-full border border-white/20 bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 flex items-center justify-center text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              aria-label="Leggi descrizione evento"
            >
              i
            </button>
          </div>

          {/* Tabella 1x2: SÌ | NO (prezzo = probabilità, click per comprare quote) */}
          {(() => {
            const displayProbability = typeof event.probability === "number" ? event.probability : 50;
            const yesPct = displayProbability;
            return (
              <>
                <div id="prediction-section" className="grid grid-cols-2 gap-3 mb-3">
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

                {/* Barra indicatore SÌ/NO (prezzo = probabilità) */}
                <div className="mb-3">
                  <div className="flex justify-between text-ds-caption font-medium text-fg-muted mb-1.5">
                    <span>SÌ {displayProbability.toFixed(1)}%</span>
                    <span>NO {(100 - displayProbability).toFixed(1)}%</span>
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
              </>
            );
          })()}

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

          {/* Box sotto al contatore: Vendi posizioni + Storico (solo se hai posizioni) */}
          {userPosition && (() => {
            const yesShareMicros = BigInt(userPosition.yesShareMicros);
            const noShareMicros = BigInt(userPosition.noShareMicros);
            const yesShares = Math.round(Number(yesShareMicros) / SCALE);
            const noShares = Math.round(Number(noShareMicros) / SCALE);
            const yesCredits = Math.round(Number(BigInt(userPosition.positionYesCostMicros ?? "0")) / SCALE);
            const noCredits = Math.round(Number(BigInt(userPosition.positionNoCostMicros ?? "0")) / SCALE);
            const hasShares = yesShares > 0 || noShares > 0;
            const marketOpen = !event.resolved && new Date(event.closesAt) > new Date();
            const displayedHistory = showAllTransactions ? tradeHistory : tradeHistory.slice(0, 2);
            const hasMoreThanTwo = tradeHistory.length > 2;

            const renderTransactionItem = (t: TradeHistoryEntry) => {
              const shares = Math.round(Number(BigInt(t.shareMicros)) / SCALE);
              const credits = Math.round(Number(BigInt(t.costMicros) < 0 ? -BigInt(t.costMicros) : BigInt(t.costMicros)) / SCALE);
              const esito = t.outcome === "YES" ? "SÌ" : "NO";
              const dataOra = new Date(t.createdAt).toLocaleString("it-IT", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              const dataSolo = new Date(t.createdAt).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
              const oraSolo = new Date(t.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
              if (t.side === "BUY") {
                return (
                  <li key={t.id} className="text-ds-body-sm text-fg-muted flex flex-col gap-0.5">
                    <span>
                      Hai acquistato <span className="font-semibold text-fg">{shares.toLocaleString("it-IT")} &quot;{esito}&quot;</span> per{" "}
                      <span className="font-semibold text-fg">{credits.toLocaleString("it-IT")} crediti</span>
                    </span>
                    <span className="text-ds-caption opacity-90 text-right">{dataSolo}, {oraSolo}</span>
                  </li>
                );
              }
              const realizedPlMicros = t.realizedPlMicros != null ? BigInt(t.realizedPlMicros) : null;
              const costBasisMicros = realizedPlMicros != null && t.costMicros ? BigInt(t.costMicros) - realizedPlMicros : null;
              const pct = costBasisMicros != null && costBasisMicros !== 0n
                ? Number((realizedPlMicros! * 10000n) / costBasisMicros) / 100
                : null;
              const isProfit = pct != null && pct >= 0;
              const arrow = isProfit ? "↑" : "↓";
              return (
                <li key={t.id} className="text-ds-body-sm text-fg-muted flex flex-col gap-0.5">
                  <span>
                    Hai venduto <span className="font-semibold text-fg">{shares.toLocaleString("it-IT")} &quot;{esito}&quot;</span> per{" "}
                    <span className="font-semibold text-fg">{credits.toLocaleString("it-IT")} crediti</span>
                    {pct != null && (
                      <span className={isProfit ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-red-500 dark:text-red-400 font-semibold"}>
                        {" "}({arrow} {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%)
                      </span>
                    )}
                  </span>
                  <span className="text-ds-caption opacity-90 text-right">{dataSolo}, {oraSolo}</span>
                </li>
              );
            };

            return (
              <div className="pt-4 mt-4 border-t border-white/10">
                {/* Prima: VENDI LE TUE POSIZIONI */}
                {marketOpen && hasShares && (() => {
                  const maxSell = sellOutcome === "YES" ? yesShares : noShares;
                  const num = parseFloat(sellShares);
                  const displayProbability = typeof event.probability === "number" ? event.probability : 50;
                  const currentPriceYes = displayProbability / 100;
                  const currentPriceNo = (100 - displayProbability) / 100;
                  const currentPrice = sellOutcome === "YES" ? currentPriceYes : currentPriceNo;
                  const currentPricePct = sellOutcome === "YES" ? displayProbability : 100 - displayProbability;
                  const esitoLabel = sellOutcome === "YES" ? "SÌ" : "NO";
                  const prevPct = prevProbability != null ? (sellOutcome === "YES" ? prevProbability : 100 - prevProbability) : currentPricePct;
                  const priceVariationPct = currentPricePct - prevPct;
                  const avgPriceYes = yesShares > 0 ? yesCredits / yesShares : 0;
                  const avgPriceNo = noShares > 0 ? noCredits / noShares : 0;

                  const handleSell = async () => {
                    const sellNum = parseFloat(sellShares);
                    if (!Number.isFinite(sellNum) || sellNum <= 0 || sellNum > maxSell) {
                      setSellError("Inserisci una quantità valida.");
                      return;
                    }
                    const shareMicros = BigInt(Math.round(sellNum * SCALE));
                    const maxShareMicros = sellOutcome === "YES" ? yesShareMicros : noShareMicros;
                    if (shareMicros > maxShareMicros) {
                      setSellError("Quote insufficienti da vendere. Non puoi vendere più di quanto possiedi.");
                      return;
                    }
                    setSellError(null);
                    setSellLoading(true);
                    try {
                      const res = await fetch("/api/trades/sell", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          eventId: event.id,
                          outcome: sellOutcome,
                          shareMicros: shareMicros.toString(),
                          idempotencyKey: crypto.randomUUID(),
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        setSellError(data.error || "Errore durante la vendita");
                        return;
                      }
                      const realizedPl = data.realizedPlMicros != null
                        ? Number(BigInt(data.realizedPlMicros) / BigInt(SCALE))
                        : null;
                      if (realizedPl != null) setSellSuccessPl(realizedPl);
                      setSellShares("");
                      setSellError(null);
                      await fetchEvent();
                      if (session?.user?.id) fetchUserCredits();
                      if (realizedPl != null) setTimeout(() => setSellSuccessPl(null), 6000);
                    } finally {
                      setSellLoading(false);
                    }
                  };
                  const totalShareMicros = sellOutcome === "YES" ? yesShareMicros : noShareMicros;
                  const costMicrosForOutcome = BigInt(
                    sellOutcome === "YES"
                      ? (userPosition.positionYesCostMicros ?? "0")
                      : (userPosition.positionNoCostMicros ?? "0")
                  );
                  const shareMicrosToSell = totalShareMicros > 0n && num > 0 ? BigInt(Math.round(num * SCALE)) : 0n;
                  const costBasisMicros =
                    totalShareMicros > 0n && shareMicrosToSell > 0n
                      ? (costMicrosForOutcome * shareMicrosToSell) / totalShareMicros
                      : 0n;
                  const costBasisCredits = Math.round(Number(costBasisMicros) / SCALE);
                  const estimatedProceedsCredits =
                    sellPreview.estimatedProceedsMicros != null
                      ? Math.round(Number(BigInt(sellPreview.estimatedProceedsMicros)) / SCALE)
                      : null;
                  const plCredits = estimatedProceedsCredits != null ? estimatedProceedsCredits - costBasisCredits : null;
                  const hasValidPl = plCredits != null && Number.isFinite(plCredits);

                  return (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4 md:p-5">
                      <div className="flex items-center justify-center gap-2 mb-5">
                        <p className="text-ds-body font-bold text-fg uppercase tracking-label">Vendi le tue posizioni</p>
                        <button
                          type="button"
                          onClick={() => setShowSellInfoPopup(true)}
                          className="w-6 h-6 rounded-full border border-white/20 bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 flex items-center justify-center text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                          aria-label="Come funziona la vendita e il payoff delle quote"
                        >
                          i
                        </button>
                      </div>

                      {/* Hai: */}
                      <p className="text-ds-caption font-semibold text-fg-muted uppercase tracking-micro mb-2">Hai:</p>
                      <ul className="space-y-2 mb-5 text-center">
                        {yesShares > 0 && (
                          <li className="text-ds-body-sm text-fg flex flex-col items-center justify-center gap-0.5">
                            <span className="inline-flex flex-wrap items-center justify-center gap-2">
                              <span className="font-numeric tabular-nums">{yesShares.toLocaleString("it-IT")} &quot;SÌ&quot;</span>
                              <span className="text-fg-muted">acquistati per</span>
                              <span className="font-semibold font-numeric tabular-nums">{yesCredits.toLocaleString("it-IT")}</span>
                              <IconCurrency className="w-4 h-4 text-primary shrink-0" aria-hidden />
                            </span>
                            <span className="text-ds-caption text-fg-muted">(acquistati a {avgPriceYes.toFixed(2)} ({Math.round(avgPriceYes * 100)}%))</span>
                          </li>
                        )}
                        {noShares > 0 && (
                          <li className="text-ds-body-sm text-fg flex flex-col items-center justify-center gap-0.5">
                            <span className="inline-flex flex-wrap items-center justify-center gap-2">
                              <span className="font-numeric tabular-nums">{noShares.toLocaleString("it-IT")} &quot;NO&quot;</span>
                              <span className="text-fg-muted">acquistati per</span>
                              <span className="font-semibold font-numeric tabular-nums">{noCredits.toLocaleString("it-IT")}</span>
                              <IconCurrency className="w-4 h-4 text-primary shrink-0" aria-hidden />
                            </span>
                            <span className="text-ds-caption text-fg-muted">(acquistati a {avgPriceNo.toFixed(2)} ({Math.round(avgPriceNo * 100)}%))</span>
                          </li>
                        )}
                      </ul>

                      {/* Puoi: */}
                      <p className="text-ds-caption font-semibold text-fg-muted uppercase tracking-micro mb-2">Puoi:</p>
                      <div className="text-center mb-3">
                        <p className="text-ds-body-sm text-fg-muted mb-1.5">
                          Vendere{" "}
                          <span className="inline-flex align-middle">
                            <input
                              type="number"
                              min={0}
                              max={maxSell}
                              step="1"
                              value={sellShares}
                              onChange={(e) => {
                                setSellShares(e.target.value);
                                setSellSuccessPl(null);
                              }}
                              placeholder="0"
                              className="mx-1 w-14 rounded-lg border border-white/40 bg-transparent px-2 py-1.5 text-center font-numeric text-ds-body-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-white/60 shadow-[0_0_8px_rgba(255,255,255,0.15)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              aria-label="Quantità quote da vendere"
                            />
                          </span>{" "}
                          &quot;{esitoLabel}&quot;
                        </p>
                        <p className="text-ds-body-sm text-fg-muted flex items-center justify-center gap-1.5 flex-wrap">
                          <span>al prezzo attuale</span>
                          <span className="font-semibold text-fg font-numeric tabular-nums">{currentPrice.toFixed(2)} ({currentPricePct}%)</span>
                          {priceVariationPct !== 0 && (
                            <span
                              className={`inline-flex items-center font-numeric tabular-nums text-xs font-semibold ${
                                priceVariationPct > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                              }`}
                              aria-label={priceVariationPct > 0 ? `Variazione +${priceVariationPct.toFixed(1)}%` : `Variazione ${priceVariationPct.toFixed(1)}%`}
                            >
                              {priceVariationPct > 0 ? (
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                              )}
                              {priceVariationPct > 0 ? "+" : ""}{priceVariationPct.toFixed(1)}%
                            </span>
                          )}
                        </p>
                      </div>

                      {(num > 0 && num <= maxSell) && (
                        <div className="rounded-xl bg-black/20 border border-white/10 p-3 mb-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-ds-body-sm font-numeric tabular-nums">
                            <IconCurrency className="w-4 h-4 text-primary shrink-0" aria-hidden />
                            <span className="text-fg-muted">Ricavo stimato:</span>
                            {sellPreview.loading ? (
                              <span className="text-fg">…</span>
                            ) : estimatedProceedsCredits != null ? (
                              <span className="text-fg font-semibold">{estimatedProceedsCredits.toLocaleString("it-IT")}</span>
                            ) : (
                              <span className="text-fg">—</span>
                            )}
                          </div>
                          {hasValidPl && (
                            <div className="flex items-center gap-2 text-ds-body-sm font-numeric tabular-nums pt-1 border-t border-white/10">
                              <span className="text-fg-muted">Profit or Loss:</span>
                              <span
                                className={
                                  plCredits! > 0
                                    ? "text-emerald-500 dark:text-emerald-400 font-semibold"
                                    : plCredits! < 0
                                      ? "text-red-500 dark:text-red-400 font-semibold"
                                      : "text-fg-muted font-semibold"
                                }
                              >
                                {plCredits! > 0 ? "+" : ""}{plCredits!.toLocaleString("it-IT")} crediti
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {sellSuccessPl != null && (
                        <div
                          className={`mb-3 p-3 rounded-xl border text-ds-body-sm font-semibold text-center ${
                            sellSuccessPl >= 0
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400"
                          }`}
                          role="status"
                        >
                          {sellSuccessPl >= 0 ? `+${sellSuccessPl.toLocaleString("it-IT")} crediti` : `${sellSuccessPl.toLocaleString("it-IT")} crediti`}
                        </div>
                      )}

                      <div className="flex justify-center mt-4">
                        <button
                          type="button"
                          onClick={handleSell}
                          disabled={sellLoading}
                          className="px-6 py-3 rounded-xl bg-primary text-primary-fg text-ds-body font-semibold hover:bg-primary-hover disabled:opacity-60 transition-colors"
                        >
                          {sellLoading ? "Vendita…" : "Vendi"}
                        </button>
                      </div>

                      {sellError && <p className="text-ds-caption text-danger mt-3 text-center">{sellError}</p>}
                    </div>
                  );
                })()}

                {/* Sotto: Storico transazioni (ultime 2 + Vedi tutte / Chiudi) */}
                {tradeHistory.length > 0 && (
                  <div className={marketOpen && hasShares ? "mt-5" : "mt-0"}>
                    <p className="text-ds-caption font-semibold text-fg-muted uppercase tracking-micro mb-2">Storico transazioni</p>
                    <ul className="space-y-2" role="list">
                      {displayedHistory.map((t) => renderTransactionItem(t))}
                    </ul>
                    {hasMoreThanTwo && (
                      <button
                        type="button"
                        onClick={() => setShowAllTransactions(!showAllTransactions)}
                        className="mt-2 text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline"
                      >
                        {showAllTransactions ? "Chiudi" : "Vedi tutte"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <div className="p-3 bg-warning-bg/90 border border-warning/30 rounded-xl text-ds-body-sm text-warning dark:bg-warning-bg/50 dark:text-warning mb-3">
              <Link href="/auth/login" className="font-semibold underline">Accedi</Link> per scommettere
            </div>
          )}

          <CommentsSection eventId={event.id} variant="embedded" />

          {/* Criterio di risoluzione e scadenza: solo "i" che apre popup */}
          <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setShowResolutionPopup(true)}
              className="w-8 h-8 rounded-full border border-white/20 bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 flex items-center justify-center text-sm font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              aria-label="Criterio di risoluzione e scadenza"
            >
              i
            </button>
          </div>
        </article>

        {/* Box 2: Grafico — centrato nella pagina, titolo e assi bilanciati */}
        <section className="event-detail-box event-detail-box-neon event-detail-box-chart transition-all duration-ds-normal p-4 md:p-6 mb-4" aria-labelledby="chart-heading">
          <EventProbabilityChart eventId={event.id} range="7d" refetchTrigger={event._count.predictions} layout="standalone" predictionsCount={event._count.predictions} />
        </section>
      </main>

      {/* Popup Descrizione evento */}
      {showDescriptionPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-[background-color,filter] duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="description-popup-title"
          onClick={() => setShowDescriptionPopup(false)}
        >
          <div
            className="event-detail-box event-detail-box-neon max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 id="description-popup-title" className="text-ds-h3 font-bold text-fg">Descrizione evento</h2>
              <button
                type="button"
                onClick={() => setShowDescriptionPopup(false)}
                className="p-2.5 rounded-xl text-fg-muted hover:text-fg hover:bg-surface/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Chiudi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {event.description ? (
              <p className="text-ds-body-sm text-fg-muted whitespace-pre-wrap leading-relaxed">{event.description}</p>
            ) : (
              <p className="text-ds-body-sm text-fg-muted">Nessuna descrizione disponibile.</p>
            )}
          </div>
        </div>
      )}

      {/* Popup Info vendita / payoff quote */}
      {showSellInfoPopup && event && userPosition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-[background-color,filter] duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sell-info-popup-title"
          onClick={() => setShowSellInfoPopup(false)}
        >
          <div
            className="event-detail-box event-detail-box-neon max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center mb-4 pr-12">
              <h2 id="sell-info-popup-title" className="text-ds-h3 font-bold text-fg uppercase tracking-label text-center">Come funziona</h2>
              <button
                type="button"
                onClick={() => setShowSellInfoPopup(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-fg-muted hover:text-fg hover:bg-surface/50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Chiudi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-ds-body-sm text-fg-muted mb-4">
              Ogni quota paga 1 <IconCurrency className="w-4 h-4 text-primary inline-block align-middle" aria-hidden /> se l&apos;esito che hai scelto si verifica (SÌ o NO).<br />
              Se non si verifica, paga 0.
            </p>
            <p className="text-ds-h3 font-bold text-fg uppercase tracking-label text-center mb-2">Esempio</p>
            <p className="text-ds-body-sm text-fg-muted mb-2">Hai 100 quote SÌ.</p>
            <p className="text-ds-body-sm text-fg-muted mb-1">
              Se l&apos;evento è SÌ → ricevi <span className="font-semibold text-emerald-500 dark:text-emerald-400">100</span> crediti.
            </p>
            <p className="text-ds-body-sm text-fg-muted mb-4">
              Se l&apos;evento è NO → ricevi <span className="font-semibold text-red-500 dark:text-red-400">0</span>.
            </p>
            <p className="text-ds-body-sm text-fg-muted pt-3 border-t border-white/10 text-center">
              Il tuo profitto dipende dal prezzo a cui hai acquistato le quote.
            </p>
          </div>
        </div>
      )}

      {/* Popup Criterio di risoluzione e scadenza */}
      {showResolutionPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-[background-color,filter] duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-popup-title"
          onClick={() => setShowResolutionPopup(false)}
        >
          <div
            className="event-detail-box event-detail-box-neon max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 rounded-2xl"
            style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
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
