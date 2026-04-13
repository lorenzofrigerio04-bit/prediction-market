"use client";

import { use, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDisplayTitle } from "@/lib/debug-display";
import EventDetailHeader from "@/components/events/EventDetailHeader";
import PredictionModal from "@/components/PredictionModal";
import { PublishCommentModal } from "@/components/feed/PublishCommentModal";
import CommentsSection from "@/components/CommentsSection";
import EventProbabilityChart from "@/components/events/EventProbabilityChart";
import SellConfirmModal, { type SellConfirmLeg, type SellConfirmPayload } from "@/components/events/SellConfirmModal";
import { trackView } from "@/lib/analytics-client";
import { IconCurrency } from "@/components/ui/Icons";
import BackLink from "@/components/ui/BackLink";
import {
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
  getEventDisplayTitle,
  deriveOutcomesFromTitle,
  isMarketTypeId,
} from "@/lib/market-types";
import { parseSportMatchTitle, formatBinaryMatchTitle } from "@/lib/sport-match-title";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  createdAt: string;
  closesAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  outcome: string | null;
  resolutionSourceUrl: string | null;
  resolutionNotes: string | null;
  resolutionCriteriaYes?: string | null;
  resolutionCriteriaNo?: string | null;
  resolutionCriteria?: string | null;
  resolutionAuthorityHost?: string | null;
  marketId?: string | null;
  marketType?: string | null;
  outcomes?: unknown;
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
  bestBookmakerTitle?: string | null;
  bestYesOdds?: number | null;
  bestNoOdds?: number | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
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
  /** Multi-outcome: quote possedute per opzione */
  outcomeSharesMicros?: Record<string, string>;
  /** Multi-outcome: costo residuo per opzione */
  outcomeCostMicros?: Record<string, string>;
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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showResolutionPopup, setShowResolutionPopup] = useState(false);
  const [showSellInfoPopup, setShowSellInfoPopup] = useState(false);
  const [predictionOutcome, setPredictionOutcome] = useState<string | null>(null);
  const [sellOutcome, setSellOutcome] = useState<string>("YES");
  const [sellShares, setSellShares] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellPreview, setSellPreview] = useState<{
    estimatedProceedsMicros: string | null;
    loading: boolean;
  }>({ estimatedProceedsMicros: null, loading: false });
  const [sellSuccessPl, setSellSuccessPl] = useState<number | null>(null);
  const [sellConfirmOpen, setSellConfirmOpen] = useState(false);
  const [sellConfirmLegs, setSellConfirmLegs] = useState<SellConfirmLeg[]>([]);
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
    if (!showResolutionPopup && !showSellInfoPopup) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResolutionPopup(false);
        setShowSellInfoPopup(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showResolutionPopup, showSellInfoPopup]);

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
    const maxSell = (() => {
      if (sellOutcome === "YES") {
        return Number(BigInt(userPosition.yesShareMicros) / BigInt(SCALE));
      }
      if (sellOutcome === "NO") {
        return Number(BigInt(userPosition.noShareMicros) / BigInt(SCALE));
      }
      const outcomeShares = userPosition.outcomeSharesMicros?.[sellOutcome];
      return outcomeShares
        ? Number(BigInt(outcomeShares) / BigInt(SCALE))
        : 0;
    })();
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

  const runSellFromModal = async (payloads: SellConfirmPayload[]) => {
    if (!event || payloads.length === 0) return;
    setSellError(null);
    setSellLoading(true);
    let plSum = 0;
    let gotPl = false;
    try {
      for (const { outcome, shareMicros } of payloads) {
        const res = await fetch("/api/trades/sell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            outcome,
            shareMicros,
            idempotencyKey: crypto.randomUUID(),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSellError(data.error || "Errore durante la vendita");
          return;
        }
        if (data.realizedPlMicros != null) {
          plSum += Number(BigInt(data.realizedPlMicros) / BigInt(SCALE));
          gotPl = true;
        }
      }
      if (gotPl) setSellSuccessPl(plSum);
      setSellShares("");
      setSellError(null);
      setSellConfirmOpen(false);
      setSellConfirmLegs([]);
      await fetchEvent();
      if (session?.user?.id) fetchUserCredits();
      if (gotPl) setTimeout(() => setSellSuccessPl(null), 6000);
    } finally {
      setSellLoading(false);
    }
  };

  const handlePredictionSuccess = (outcome?: string) => {
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
        console.error(err);
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

  const handlePublishToFeed = async (content?: string | null) => {
    if (!event?.id || !session) return;
    setPublishLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          content: content?.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setShowPublishModal(false);
      router.push("/discover");
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setPublishLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-bg">
        <EventDetailHeader />
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
      <div className="min-h-screen bg-admin-bg">
        <EventDetailHeader />
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

  const outcomeOptionsRaw = parseOutcomesJson(event.outcomes);
  const outcomeOptionsDerived = deriveOutcomesFromTitle(event.title);
  const hasMultiOptionType =
    !!event.marketType &&
    isMarketTypeId(event.marketType) &&
    MULTI_OPTION_MARKET_TYPES.includes(event.marketType);
  const sportMatchTeams = (event.category === "Calcio" || event.category === "Sport") ? parseSportMatchTitle(event.title) : null;
  const isSportMatchBinary = sportMatchTeams !== null && !hasMultiOptionType;
  const outcomeOptions =
    hasMultiOptionType
      ? ((outcomeOptionsRaw && outcomeOptionsRaw.length > 0 ? outcomeOptionsRaw : outcomeOptionsDerived) ?? [])
      : sportMatchTeams
        ? [{ key: "YES", label: sportMatchTeams.teamA }, { key: "NO", label: sportMatchTeams.teamB }]
        : ((outcomeOptionsRaw && outcomeOptionsRaw.length > 0 ? outcomeOptionsRaw : outcomeOptionsDerived) ?? []);
  const hasMultiOptionTitlePattern = outcomeOptionsDerived.length > 0;
  const isMultiOptionWithOptions =
    !isSportMatchBinary &&
    (hasMultiOptionType || hasMultiOptionTitlePattern) &&
    outcomeOptions.length > 0;
  const displayTitle = isMultiOptionWithOptions
    ? getEventDisplayTitle(event.title, event.outcomes)
    : getDisplayTitle(event.title, debugMode);
  /** Titolo H1: partite binarie Calcio/Sport → sempre "Chi vincerà X vs Y?" */
  const eventHeadingTitle =
    isMultiOptionWithOptions
      ? getDisplayTitle(displayTitle, debugMode)
      : isSportMatchBinary && sportMatchTeams
        ? getDisplayTitle(formatBinaryMatchTitle(sportMatchTeams), debugMode)
        : getDisplayTitle(event.title, debugMode);
  const resolvedOutcomeLabel =
    event.resolved &&
    event.outcome &&
    isMultiOptionWithOptions &&
    outcomeOptions.find((o) => o.key === event.outcome)
      ? outcomeOptions.find((o) => o.key === event.outcome)!.label
      : null;

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Rome",
  };
  const dateOptionsShort: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Rome",
  };
  const formatPct = (value: number) => `${Number(value).toFixed(1)}%`;

  return (
    <div className="min-h-screen bg-admin-bg text-fg event-detail-kalshi-theme" suppressHydrationWarning>
      <EventDetailHeader />
      <main id="main-content" ref={mainRef} className="event-detail-page-main mx-auto px-3 py-5 md:px-4 md:py-10 max-w-3xl pb-12 md:pb-28 space-y-6 md:space-y-8">
        {/* Back link */}
        <BackLink
          href="/"
          className="inline-flex items-center min-h-[40px] text-fg-muted hover:text-fg rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg mb-1"
        >
          <svg className="w-5 h-5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-sm">Indietro</span>
        </BackLink>

        {/* Breadcrumb + Titolo (stile Kalshi) */}
        <header className="space-y-2">
          <p className="text-xs md:text-sm text-fg-muted font-medium tracking-wide">
            {event.category}
          </p>
          <h1 className="font-kalshi text-[1.55rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.1rem] font-bold text-fg leading-[1.1] tracking-[0.01em] max-w-full">
            {eventHeadingTitle}
          </h1>
          <div className="flex items-center gap-2 pt-1">
            {session?.user?.id ? (
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`inline-flex min-h-[40px] items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  isFollowing
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-white/20 bg-white/5 text-fg hover:border-primary/50 hover:text-primary"
                } disabled:cursor-not-allowed disabled:opacity-70`}
                aria-label={isFollowing ? "Rimuovi mi piace mercato" : "Metti mi piace mercato"}
              >
                {followLoading ? "..." : isFollowing ? "Mi piace messo" : "Mi piace"}
              </button>
            ) : (
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(`/events/${event.id}`)}`}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-fg hover:border-primary/50 hover:text-primary"
              >
                Mi piace
              </Link>
            )}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-fg hover:border-primary/50 hover:text-primary"
              aria-label="Condividi evento"
            >
              {shareCopied ? "Link copiato" : "Condividi"}
            </button>
          </div>
        </header>

        {/* Grafico: senza box, full-bleed su mobile */}
        <section
          className="event-detail-chart-bleed -mx-3 w-[calc(100%+1.5rem)] md:mx-0 md:w-full max-w-[100vw] md:max-w-none"
          aria-labelledby="chart-heading"
        >
          <EventProbabilityChart
            eventId={event.id}
            range="7d"
            refetchTrigger={event._count.predictions}
            layout="standalone"
            predictionsCount={event._count.predictions}
            valueUnit="percent"
            embeddedInPage
            outcomeOptions={isMultiOptionWithOptions ? outcomeOptions : undefined}
          />
        </section>

        {/* Sezione acquisto share (incorporata, senza card) */}
        <article className="event-detail-embed-section py-5 md:py-6">
          {/* Mercato multi-opzione: pulsanti opzioni */}
          {isMultiOptionWithOptions ? (
            <div id="prediction-section" className="mb-3">
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <p className="font-kalshi text-lg sm:text-xl md:text-2xl font-bold text-fg text-center leading-tight">
                  Scegli un&apos;opzione
                </p>
                <button
                  type="button"
                  onClick={() => setShowSellInfoPopup(true)}
                  className="shrink-0 w-8 h-8 rounded-full border border-white/20 bg-transparent text-fg-muted hover:text-fg hover:bg-white/[0.06] flex items-center justify-center text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
                  aria-label="Come funziona il pagamento delle quote"
                >
                  i
                </button>
              </div>
              <div className={`grid gap-2 ${outcomeOptions.length === 4 ? "grid-cols-2" : "grid-cols-1"}`}>
                {outcomeOptions.map((opt) => (
                  (() => {
                    const optPct = event.outcomeProbabilities?.find((p) => p.key === opt.key)?.probabilityPct;
                    const isSelected = predictionOutcome === opt.key;
                    return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      if (canMakePrediction) {
                        setPredictionOutcome(opt.key);
                        setShowPredictionModal(true);
                      }
                    }}
                    disabled={!canMakePrediction || event.resolved}
                    className={`w-full min-h-[52px] py-2.5 px-3 rounded-xl text-left transition-colors border-2 bg-transparent ${
                      isSelected
                        ? "border-primary/70 text-fg"
                        : "border-white/15 hover:border-white/25 text-fg"
                    } disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg`}
                    aria-label={`Opzione: ${opt.label}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-fg leading-snug line-clamp-2">
                        {opt.label}
                      </span>
                      {typeof optPct === "number" && (
                        <span className="shrink-0 text-sm font-extrabold font-chubby tabular-nums text-fg-muted">
                          {formatPct(optPct)}
                        </span>
                      )}
                    </span>
                  </button>
                    );
                  })()
                ))}
              </div>
              {!event.resolved && new Date(event.closesAt) > new Date() && !session && (
                <p className="text-ds-caption text-fg-muted mt-2">Accedi per scommettere su un&apos;opzione.</p>
              )}
            </div>
          ) : (
            (() => {
              const displayProbability = typeof event.probability === "number" ? event.probability : 50;
              const yesPct = displayProbability;
              const noPct = 100 - yesPct;
              const leftLabel = sportMatchTeams?.teamA ?? "SÌ";
              const rightLabel = sportMatchTeams?.teamB ?? "NO";
              const leftBorder = yesPct >= noPct ? "border-emerald-400" : "border-rose-500";
              const rightBorder = noPct > yesPct ? "border-emerald-400" : "border-rose-500";
              const leftPctColor = yesPct >= noPct ? "text-emerald-400" : "text-rose-500";
              const rightPctColor = noPct > yesPct ? "text-emerald-400" : "text-rose-500";
              return (
                <>
                  <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                    <p className="font-kalshi text-lg sm:text-xl md:text-2xl font-bold text-fg text-center leading-tight">
                      Fai la tua previsione!
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowSellInfoPopup(true)}
                      className="shrink-0 w-8 h-8 rounded-full border border-white/20 bg-transparent text-fg-muted hover:text-fg hover:bg-white/[0.06] flex items-center justify-center text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
                      aria-label="Come funziona il pagamento delle quote"
                    >
                      i
                    </button>
                  </div>
                  <div id="prediction-section" className="grid grid-cols-2 gap-2.5 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (canMakePrediction) {
                          setPredictionOutcome("YES");
                          setShowPredictionModal(true);
                        }
                      }}
                      disabled={!canMakePrediction}
                      className={`min-h-[48px] py-2.5 px-2 rounded-xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-0.5 bg-transparent border-2 ${leftBorder} text-fg hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg`}
                      aria-label={sportMatchTeams ? `Scommetti su ${leftLabel}` : "Prevedi SÌ"}
                    >
                      <span className="text-fg line-clamp-2 max-w-full text-center text-sm leading-tight">{leftLabel}</span>
                      <span className={`text-sm sm:text-base font-extrabold font-chubby tabular-nums ${leftPctColor}`}>
                        {formatPct(yesPct)}
                      </span>
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
                      className={`min-h-[48px] py-2.5 px-2 rounded-xl font-semibold text-sm transition-all flex flex-col items-center justify-center gap-0.5 bg-transparent border-2 ${rightBorder} text-fg hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg`}
                      aria-label={sportMatchTeams ? `Scommetti su ${rightLabel}` : "Prevedi NO"}
                    >
                      <span className="text-fg line-clamp-2 max-w-full text-center text-sm leading-tight">{rightLabel}</span>
                      <span className={`text-sm sm:text-base font-extrabold font-chubby tabular-nums ${rightPctColor}`}>
                        {formatPct(noPct)}
                      </span>
                    </button>
                  </div>
                </>
              );
            })()
          )}

          {event.resolved && (
            <div className="box-raised p-3 mb-3">
              <p className="text-ds-body font-semibold text-fg">
                Previsioni chiuse. Risultato: {resolvedOutcomeLabel ?? (event.outcome === "YES" ? "SÌ" : event.outcome === "NO" ? "NO" : event.outcome)}.
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

          {/* Posizioni aperte (wallet) */}
          {userPosition && (() => {
            const yesShareMicros = BigInt(userPosition.yesShareMicros);
            const noShareMicros = BigInt(userPosition.noShareMicros);
            const yesShares = Math.round(Number(yesShareMicros) / SCALE);
            const noShares = Math.round(Number(noShareMicros) / SCALE);
            const yesCredits = Math.round(Number(BigInt(userPosition.positionYesCostMicros ?? "0")) / SCALE);
            const noCredits = Math.round(Number(BigInt(userPosition.positionNoCostMicros ?? "0")) / SCALE);
            const multiPositionEntries = outcomeOptions
              .map((opt) => {
                const micros = BigInt(userPosition.outcomeSharesMicros?.[opt.key] ?? "0");
                return { key: opt.key, label: opt.label, sharesMicros: micros, shares: Math.round(Number(micros) / SCALE) };
              })
              .filter((e) => e.shares > 0);
            const hasMultiShares = multiPositionEntries.length > 0;
            const hasShares = yesShares > 0 || noShares > 0 || hasMultiShares;
            const marketOpen = !event.resolved && new Date(event.closesAt) > new Date();

            const colWallet = (shares: number, credits: number, avgPrice: number, label: string) => (
              <div className="space-y-2 min-h-[5.5rem]">
                <p className="text-sm text-fg leading-snug text-center sm:text-left">
                  <span className="font-chubby text-base sm:text-lg font-extrabold tabular-nums">
                    {shares.toLocaleString("it-IT")}
                  </span>
                  <span className="text-fg-muted font-medium"> quote </span>
                  <span className="font-medium">&quot;{label}&quot;</span>
                </p>
                <p className="text-xs text-fg-muted leading-relaxed text-center sm:text-left">
                  Costo:{" "}
                  <span className="font-chubby font-semibold tabular-nums text-fg">{credits.toLocaleString("it-IT")}</span>
                  <IconCurrency className="w-3.5 h-3.5 text-primary inline-block align-middle mx-0.5" aria-hidden />
                  {avgPrice > 0 && (
                    <>
                      {" "}
                      · Prezzo medio{" "}
                      <span className="font-chubby font-semibold tabular-nums text-fg">{formatPct(Math.round(avgPrice * 100))}</span>
                    </>
                  )}
                </p>
              </div>
            );

            if (isMultiOptionWithOptions) {
              if (!marketOpen || !hasMultiShares) return null;

              const nMulti = multiPositionEntries.length;
              const openMultiSellConfirm = () => {
                setSellError(null);
                const legs: SellConfirmLeg[] = [];
                for (const entry of multiPositionEntries) {
                  if (entry.sharesMicros <= 0n) continue;
                  const costMicros = BigInt(userPosition.outcomeCostMicros?.[entry.key] ?? "0");
                  const costCredits = Math.round(Number(costMicros) / SCALE);
                  legs.push({
                    outcome: entry.key,
                    label: entry.label,
                    shareMicros: entry.sharesMicros.toString(),
                    shares: entry.shares,
                    costCredits,
                  });
                }
                if (legs.length === 0) return;
                setSellConfirmLegs(legs);
                setSellConfirmOpen(true);
              };

              const anyMultiMicros = multiPositionEntries.some((e) => e.sharesMicros > 0n);

              return (
                <div className="pt-6 mt-6">
                  <div className="pb-2">
                    <p className="font-kalshi text-2xl sm:text-3xl md:text-[2rem] font-bold text-fg mb-4 text-center tracking-tight">
                      Wallet
                    </p>
                    <div
                      className={
                        nMulti >= 2
                          ? nMulti === 2
                            ? "relative grid grid-cols-2 gap-3"
                            : "grid grid-cols-1 sm:grid-cols-2 gap-3"
                          : "grid grid-cols-1"
                      }
                    >
                      {nMulti === 2 && (
                        <span
                          className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[1] w-px -translate-x-1/2 bg-white/[0.14]"
                          aria-hidden
                        />
                      )}
                      {multiPositionEntries.map((entry, idx) => {
                        const costMicros = BigInt(userPosition.outcomeCostMicros?.[entry.key] ?? "0");
                        const costCredits = Math.round(Number(costMicros) / SCALE);
                        const avgPrice = entry.shares > 0 ? costCredits / entry.shares : 0;
                        return (
                          <div
                            key={entry.key}
                            className={nMulti === 2 ? (idx === 0 ? "min-w-0 pr-1" : "min-w-0 pl-1") : "min-w-0"}
                          >
                            {colWallet(entry.shares, costCredits, avgPrice, entry.label)}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={openMultiSellConfirm}
                      disabled={sellLoading || !anyMultiMicros}
                      className="mt-5 w-full min-h-[48px] rounded-xl bg-primary text-bg font-kalshi text-base sm:text-lg font-bold tracking-tight uppercase hover:bg-primary-hover disabled:opacity-60 transition-colors"
                    >
                      {sellLoading ? "Vendita…" : "Vendi"}
                    </button>

                    {sellSuccessPl != null && (
                      <div
                        className={`mt-4 py-2 text-sm font-chubby font-bold tabular-nums text-center ${
                          sellSuccessPl >= 0 ? "text-emerald-400" : "text-rose-500"
                        }`}
                        role="status"
                      >
                        {sellSuccessPl >= 0 ? `+${sellSuccessPl.toLocaleString("it-IT")}` : sellSuccessPl.toLocaleString("it-IT")}{" "}
                        crediti
                      </div>
                    )}

                    {sellError && <p className="text-sm text-rose-500 mt-3 text-center">{sellError}</p>}
                  </div>
                </div>
              );
            }

            if (!marketOpen || !hasShares) return null;

            return (
              <div className="pt-6 mt-6">
                {(() => {
                  const avgPriceYes = yesShares > 0 ? yesCredits / yesShares : 0;
                  const avgPriceNo = noShares > 0 ? noCredits / noShares : 0;
                  const yesLbl = outcomeOptions.find((o) => o.key === "YES")?.label ?? "SÌ";
                  const noLbl = outcomeOptions.find((o) => o.key === "NO")?.label ?? "NO";
                  const yMicrosStart = yesShareMicros;
                  const nMicrosStart = noShareMicros;

                  const openBinarySellConfirm = () => {
                    if (yMicrosStart <= 0n && nMicrosStart <= 0n) return;
                    setSellError(null);
                    const legs: SellConfirmLeg[] = [];
                    if (yesShares > 0) {
                      legs.push({
                        outcome: "YES",
                        label: yesLbl,
                        shareMicros: yMicrosStart.toString(),
                        shares: yesShares,
                        costCredits: yesCredits,
                      });
                    }
                    if (noShares > 0) {
                      legs.push({
                        outcome: "NO",
                        label: noLbl,
                        shareMicros: nMicrosStart.toString(),
                        shares: noShares,
                        costCredits: noCredits,
                      });
                    }
                    if (legs.length === 0) return;
                    setSellConfirmLegs(legs);
                    setSellConfirmOpen(true);
                  };

                  const showYes = yesShares > 0;
                  const showNo = noShares > 0;
                  const showBoth = showYes && showNo;

                  return (
                    <div className="pb-2">
                      <p className="font-kalshi text-2xl sm:text-3xl md:text-[2rem] font-bold text-fg mb-4 text-center tracking-tight">
                        Wallet
                      </p>
                      <div
                        className={
                          showBoth ? "relative grid grid-cols-2 gap-3" : "grid grid-cols-1"
                        }
                      >
                        {showBoth && (
                          <span
                            className="pointer-events-none absolute left-1/2 top-0 bottom-0 z-[1] w-px -translate-x-1/2 bg-white/[0.14]"
                            aria-hidden
                          />
                        )}
                        {showYes && (
                          <div className={showBoth ? "min-w-0 pr-1" : "min-w-0"}>
                            {colWallet(yesShares, yesCredits, avgPriceYes, yesLbl)}
                          </div>
                        )}
                        {showNo && (
                          <div className={showBoth ? "min-w-0 pl-1" : "min-w-0"}>
                            {colWallet(noShares, noCredits, avgPriceNo, noLbl)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={openBinarySellConfirm}
                        disabled={sellLoading || (yMicrosStart <= 0n && nMicrosStart <= 0n)}
                        className="mt-5 w-full min-h-[48px] rounded-xl bg-primary text-bg font-kalshi text-base sm:text-lg font-bold tracking-tight uppercase hover:bg-primary-hover disabled:opacity-60 transition-colors"
                      >
                        {sellLoading ? "Vendita…" : "Vendi"}
                      </button>

                      {sellSuccessPl != null && (
                        <div
                          className={`mt-4 py-2 text-sm font-chubby font-bold tabular-nums text-center ${
                            sellSuccessPl >= 0 ? "text-emerald-400" : "text-rose-500"
                          }`}
                          role="status"
                        >
                          {sellSuccessPl >= 0 ? `+${sellSuccessPl.toLocaleString("it-IT")}` : sellSuccessPl.toLocaleString("it-IT")} crediti
                        </div>
                      )}

                      {sellError && <p className="text-sm text-rose-500 mt-3 text-center">{sellError}</p>}
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          {!session && !event.resolved && new Date(event.closesAt) > new Date() && (
            <p className="text-ds-body-sm text-fg-muted mb-3">
              <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-hover underline">Accedi</Link>{" "}
              per scommettere
            </p>
          )}

        </article>

        {/* Market Rules (inline) */}
        <section className="event-detail-embed-section py-5 md:py-6 border-t border-white/[0.06]" aria-labelledby="market-rules-heading">
          <h2 id="market-rules-heading" className="text-sm md:text-base font-semibold text-fg tracking-tight mb-3 uppercase tracking-label">
            Regole di mercato
          </h2>
          <div className="space-y-4 text-ds-body-sm text-fg-muted">
            {(event.resolutionCriteriaYes || event.resolutionCriteriaNo || event.resolutionCriteria || event.resolutionNotes) ? (
              event.resolutionCriteria ? (
                <p className="whitespace-pre-wrap">{event.resolutionCriteria}</p>
              ) : (
                <div className="space-y-2">
                  {event.resolutionCriteriaYes && (
                    <p><span className="font-medium text-success">SÌ paga se:</span> {event.resolutionCriteriaYes}</p>
                  )}
                  {event.resolutionCriteriaNo && (
                    <p><span className="font-medium text-danger">NO paga se:</span> {event.resolutionCriteriaNo}</p>
                  )}
                  {event.resolutionNotes && <p className="whitespace-pre-wrap">{event.resolutionNotes}</p>}
                </div>
              )
            ) : (
              <p className="italic">Criterio non specificato. La risoluzione avviene secondo la fonte ufficiale indicata.</p>
            )}
            {event.resolutionSourceUrl && (
              <p>
                Fonte:{" "}
                <a href={event.resolutionSourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover underline">
                  {event.resolutionAuthorityHost || event.resolutionSourceUrl.replace(/^https?:\/\//, "").split("/")[0]}
                </a>
              </p>
            )}
            <p className="pt-2 border-t border-border/60 text-fg/80">
              Chiusura: <span suppressHydrationWarning>{new Date(event.closesAt).toLocaleDateString("it-IT", dateOptions)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResolutionPopup(true)}
            className="mt-3 text-sm font-medium text-primary hover:text-primary-hover underline"
          >
            Dettagli completi
          </button>
        </section>

        {/* Commenti */}
        <section className="event-detail-embed-section py-5 md:py-6 border-t border-white/[0.06]" aria-labelledby="comments-heading">
          <h2 id="comments-heading" className="text-sm md:text-base font-semibold text-fg tracking-tight mb-3 uppercase tracking-label">
            Commenti
          </h2>
          <CommentsSection eventId={event.id} variant="embedded" />
        </section>
      </main>

      {/* Popup Info vendita / payoff quote */}
      {showSellInfoPopup && event && (
        <div
          className="scrim-below-app-header z-50 flex items-center justify-center p-4 bg-admin-bg/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sell-info-popup-title"
          onClick={() => setShowSellInfoPopup(false)}
        >
          <div
            className="event-detail-section max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 rounded-xl border border-white/10"
            style={{ background: 'rgb(var(--admin-bg))', boxShadow: '0 8px 32px rgb(0 0 0 / 0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex items-center justify-center mb-4 pr-12">
              <h2 id="sell-info-popup-title" className="font-kalshi text-xl sm:text-2xl font-bold text-fg text-center tracking-tight">Come funziona</h2>
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
              Se l&apos;evento è SÌ → ricevi <span className="font-semibold text-success">100</span> crediti.
            </p>
            <p className="text-ds-body-sm text-fg-muted mb-4">
              Se l&apos;evento è NO → ricevi <span className="font-semibold text-danger">0</span>.
            </p>
            <p className="text-ds-body-sm text-fg-muted pt-3 border-t border-border/60 text-center">
              Il tuo profitto dipende dal prezzo a cui hai acquistato le quote.
            </p>
          </div>
        </div>
      )}

      {/* Popup Regole di mercato (Market Rulebook) */}
      {showResolutionPopup && (
        <div
          className="scrim-below-app-header z-50 flex items-center justify-center p-4 bg-admin-bg/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resolution-popup-title"
          onClick={() => setShowResolutionPopup(false)}
        >
          <div
            className="event-detail-section max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 rounded-xl border border-white/10"
            style={{ background: 'rgb(var(--admin-bg))', boxShadow: '0 8px 32px rgb(0 0 0 / 0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 id="resolution-popup-title" className="text-ds-h3 font-bold text-fg">Regole di mercato</h2>
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
            <div className="space-y-5 text-ds-body-sm">
              {/* Oggetto del contratto */}
              <div>
                <h3 className="font-semibold text-fg mb-2 uppercase tracking-wider text-xs">Oggetto</h3>
                <p className="text-fg font-medium">{event.title}</p>
                {event.description && (
                  <p className="text-fg-muted mt-1.5 whitespace-pre-wrap">{event.description}</p>
                )}
              </div>

              {/* Criterio di pagamento */}
              <div>
                <h3 className="font-semibold text-fg mb-2 uppercase tracking-wider text-xs">Criterio di pagamento</h3>
                <p className="text-fg-muted mb-2 text-xs">Le quote SÌ pagano 1 credito se l&apos;esito è SÌ, 0 se NO. Le quote NO pagano 1 credito se l&apos;esito è NO, 0 se SÌ.</p>
                {(event.resolutionCriteriaYes || event.resolutionCriteriaNo || event.resolutionCriteria) ? (
                  event.resolutionCriteria ? (
                    <p className="text-fg-muted whitespace-pre-wrap">{event.resolutionCriteria}</p>
                  ) : (
                    <div className="space-y-2">
                      {event.resolutionCriteriaYes && (
                        <p className="text-fg-muted">
                          <span className="font-medium text-success">SÌ paga se:</span> {event.resolutionCriteriaYes}
                        </p>
                      )}
                      {event.resolutionCriteriaNo && (
                        <p className="text-fg-muted">
                          <span className="font-medium text-danger">NO paga se:</span> {event.resolutionCriteriaNo}
                        </p>
                      )}
                    </div>
                  )
                ) : event.resolutionNotes ? (
                  <p className="text-fg-muted whitespace-pre-wrap">{event.resolutionNotes}</p>
                ) : (
                  <p className="text-fg-muted italic">Criterio non specificato. La risoluzione avviene secondo la fonte ufficiale indicata.</p>
                )}
              </div>

              {/* Fonte di risoluzione */}
              <div>
                <h3 className="font-semibold text-fg mb-2 uppercase tracking-wider text-xs">Fonte di risoluzione</h3>
                {event.resolutionSourceUrl ? (
                  <a
                    href={event.resolutionSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-hover underline font-medium break-all"
                  >
                    {event.resolutionAuthorityHost || event.resolutionSourceUrl.replace(/^https?:\/\//, "").split("/")[0]}
                  </a>
                ) : (
                  <p className="text-fg-muted italic">Non specificata</p>
                )}
              </div>

              {/* Scadenza e identificativi */}
              <div className="pt-4 border-t border-border/60 space-y-2">
                <h3 className="font-semibold text-fg mb-2 uppercase tracking-wider text-xs">Scadenza e identificativi</h3>
                <div className="space-y-1 text-fg-muted">
                  <p><span className="text-fg/80">Chiusura:</span> <span suppressHydrationWarning>{new Date(event.closesAt).toLocaleDateString("it-IT", dateOptions)}</span></p>
                  {event.marketId && <p><span className="text-fg/80">ID mercato:</span> {event.marketId}</p>}
                  <p><span className="text-fg/80">Creato:</span> {event.createdBy.name || "Utente"} · <span suppressHydrationWarning>{new Date(event.createdAt).toLocaleDateString("it-IT", dateOptionsShort)}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SellConfirmModal
        open={sellConfirmOpen}
        onClose={() => {
          setSellConfirmOpen(false);
          setSellConfirmLegs([]);
          setSellError(null);
        }}
        eventId={event.id}
        eventTitle={eventHeadingTitle}
        legs={sellConfirmLegs}
        onConfirm={runSellFromModal}
        confirming={sellLoading}
        error={sellError}
      />

      {showPredictionModal && (
        <PredictionModal
          eventId={event.id}
          eventTitle={eventHeadingTitle}
          isOpen={showPredictionModal}
          onClose={() => {
            setShowPredictionModal(false);
            setPredictionOutcome(null);
          }}
          onSuccess={handlePredictionSuccess}
          userCredits={userCredits}
          initialOutcome={predictionOutcome}
          outcomeLabels={sportMatchTeams ? { YES: sportMatchTeams.teamA, NO: sportMatchTeams.teamB } : undefined}
          outcomeOptions={isMultiOptionWithOptions ? outcomeOptions : undefined}
          binaryYesProbabilityPct={
            !isMultiOptionWithOptions ? (typeof event.probability === "number" ? event.probability : 50) : undefined
          }
          outcomeProbabilityPctByKey={
            isMultiOptionWithOptions
              ? Object.fromEntries((event.outcomeProbabilities ?? []).map((p) => [p.key, p.probabilityPct]))
              : undefined
          }
        />
      )}
      <PublishCommentModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onSubmit={(content) => handlePublishToFeed(content)}
        title="Pubblica con commento"
        submitLabel="Pubblica"
        loading={publishLoading}
      />
    </div>
  );
}
