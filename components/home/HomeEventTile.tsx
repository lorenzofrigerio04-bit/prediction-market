"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";
import {
  parseSportMatchTitle,
  formatBinaryMatchTitle,
} from "@/lib/sport-match-title";
import {
  MULTI_OPTION_MARKET_TYPES,
  isMarketTypeId,
  parseOutcomesJson,
  getEventDisplayTitle,
  deriveOutcomesFromTitle,
} from "@/lib/market-types";

export type HomeEventTileVariant = "popular" | "closing" | "foryou";

export interface HomeEventTileProps {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
  variant: HomeEventTileVariant;
  /** Se true, l’evento è risolto con esito */
  resolved?: boolean;
  onNavigate?: () => void;
  compact?: boolean;
  /** Non usato: si usa solo l'immagine della categoria. */
  imageUrl?: string | null;
  /** Testo in alto a destra (es. data partita "19 mar"). */
  topRightLabel?: string | null;
  /** Tipo mercato: BINARY, MULTIPLE_CHOICE, COUNT_VOLUME, ecc. */
  marketType?: string | null;
  /** Opzioni per eventi multi-outcome */
  outcomes?: Array<{ key: string; label: string }> | null;
  /** Probabilità per singola opzione nei mercati multi-outcome */
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
  /** Generato dal Football Intelligence Engine (FIE 2.0) — mostra contorno illuminato */
  isFie?: boolean;
  /** True when at least one admin AI feedback exists for the event */
  hasFeedback?: boolean;
}

const MULTI_OUTCOME_ACCENT_CLASSES = [
  { border: "border-emerald-400/80", label: "text-emerald-400" },
  { border: "border-cyan-300/80", label: "text-cyan-300" },
  { border: "border-violet-400/80", label: "text-violet-300" },
  { border: "border-amber-300/80", label: "text-amber-300" },
  { border: "border-rose-400/80", label: "text-rose-400" },
  { border: "border-indigo-300/80", label: "text-indigo-300" },
] as const;

function formatTimeLeftShort(closesAt: string, nowMs: number): string {
  if (nowMs <= 0) return "—";
  const ms = new Date(closesAt).getTime() - nowMs;
  if (ms <= 0) return "Chiuso";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function HomeEventTile({
  id,
  title,
  category,
  closesAt,
  yesPct,
  variant,
  resolved,
  onNavigate,
  compact = false,
  imageUrl,
  topRightLabel,
  marketType,
  outcomes,
  outcomeProbabilities,
  isFie = false,
  hasFeedback = false,
}: HomeEventTileProps) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const update = () => setNow(Date.now());
    queueMicrotask(update);
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const noPct = 100 - yesPct;
  const categoryImagePath = getCategoryImagePath(category);
  const fallbackGradient = getCategoryFallbackGradient(category);
  const [categoryImageFailed, setCategoryImageFailed] = useState(false);
  const [eventImageFailed, setEventImageFailed] = useState(false);
  const normalizedEventImageUrl = imageUrl?.trim() ? imageUrl : null;
  const useEventImage = !!normalizedEventImageUrl && !eventImageFailed;
  const useCategoryImage = categoryImagePath && !categoryImageFailed;
  const useImage = useEventImage || useCategoryImage;
  const closesAtMs = new Date(closesAt).getTime();
  const isClosedOrClosing = variant === "closing" || (now > 0 && closesAtMs <= now);
  const showFeedbackBadge = process.env.NODE_ENV !== "production" && hasFeedback;

  const teams = parseSportMatchTitle(title);
  const isCalcioMatch = category === "Calcio" && teams !== null;
  const hasMultiOptionType =
    !!marketType &&
    isMarketTypeId(marketType) &&
    MULTI_OPTION_MARKET_TYPES.includes(marketType);
  const outcomeOptions =
    parseOutcomesJson(outcomes) ??
    (deriveOutcomesFromTitle(title).length > 0 ? deriveOutcomesFromTitle(title) : null);
  const isMultiOutcome = hasMultiOptionType || (outcomeOptions && outcomeOptions.length > 2);
  const outcomeProbabilityByKey = new Map(
    (outcomeProbabilities ?? []).map((entry) => [entry.key, entry.probabilityPct])
  );
  const rankedOutcomeEntries = (outcomeOptions ?? [])
    .map((opt, index) => {
      const fallbackPct = Math.round(
        100 / Math.max(1, (outcomeOptions ?? []).length)
      );
      const rawPct = outcomeProbabilityByKey.get(opt.key);
      const probabilityPct =
        typeof rawPct === "number" && Number.isFinite(rawPct)
          ? Math.round(rawPct)
          : fallbackPct;
      return { opt, index, probabilityPct };
    })
    .sort((a, b) => {
      if (b.probabilityPct !== a.probabilityPct) {
        return b.probabilityPct - a.probabilityPct;
      }
      return a.index - b.index;
    });
  const visibleOutcomeEntries = rankedOutcomeEntries.slice(0, 4);

  /** Titolo da mostrare: binario "Chi vincerà X vs Y?", multi-outcome domanda senza opzioni */
  const displayTitle = isMultiOutcome
    ? getEventDisplayTitle(title)
    : teams
      ? formatBinaryMatchTitle(teams)
      : title;

  const minH = "min-h-[220px] sm:min-h-[250px]";
  const pClass = "p-4 sm:p-5";
  const flexFill = "h-full min-h-0";
  const titleClampClass = compact ? "line-clamp-2" : "line-clamp-3";
  const titleSizeClass = compact ? "text-[0.98rem] sm:text-[1.05rem]" : "text-[1.08rem] sm:text-[1.2rem]";
  const responseAreaClass = compact ? "h-[82px] sm:h-[88px]" : "h-[92px] sm:h-[100px]";
  const binaryResponseAreaClass = compact ? "h-[112px] sm:h-[120px]" : "h-[122px] sm:h-[132px]";

  return (
    <Link
      href={`/events/${id}`}
      onClick={onNavigate}
      className={`home-event-tile group relative block ${minH} ${flexFill} overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.08)]${isFie ? " fie-glow" : ""}`}
    >
      {/* Sfondo: foto AI se disponibile, altrimenti img categoria, fallback gradiente */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{
          background: useImage ? undefined : fallbackGradient,
        }}
      />
      {useEventImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalizedEventImageUrl ?? undefined}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-95 contrast-105 saturate-105"
          onError={() => setEventImageFailed(true)}
        />
      )}
      {!useEventImage && useCategoryImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoryImagePath}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-95 contrast-105 saturate-105"
          onError={() => setCategoryImageFailed(true)}
        />
      )}
      {/* Overlay scuro per leggibilità testo (ridotto per far risaltare la foto) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/35" />
      <div className={`relative z-10 flex h-full flex-col justify-between ${pClass}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-h-[20px] items-center">
            {showFeedbackBadge && (
              <span className="rounded-full border border-emerald-300/65 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-200">
                Feedback fatto
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            {isClosedOrClosing && (
              <span className="text-xs font-bold text-amber-100 sm:text-ds-micro w-fit">
                {formatTimeLeftShort(closesAt, now)}
              </span>
            )}
            {topRightLabel && !(teams && !isMultiOutcome) && !(isMultiOutcome && outcomeOptions && outcomeOptions.length > 0) && (
              <span className="shrink-0 text-[10px] sm:text-xs font-semibold text-white/95">
                {topRightLabel}
              </span>
            )}
          </div>
        </div>
        <div className={teams && !isMultiOutcome ? "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" : isMultiOutcome && outcomeOptions && outcomeOptions.length > 0 ? "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" : "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden"}>
          {isMultiOutcome && outcomeOptions && outcomeOptions.length > 0 ? (
            /* Variante multi-outcome: 4 opzioni top in spazio fisso */
            <>
              <div className="flex-1 flex flex-col min-h-0 gap-3 w-full min-w-0 overflow-hidden">
                {topRightLabel && (
                  <span className="text-[10px] sm:text-xs font-semibold text-white/80 shrink-0">
                    {topRightLabel}
                  </span>
                )}
                <h3
                  className={`font-kalshi font-semibold leading-[1.15] tracking-[0.01em] break-words text-white shrink-0 ${titleClampClass} ${titleSizeClass}`}
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.8)" }}
                >
                  {displayTitle}
                </h3>
                <div className={`mt-auto w-full min-w-0 ${responseAreaClass}`}>
                  <div className="grid h-full grid-rows-4 gap-1.5">
                  {visibleOutcomeEntries.map((entry, index) => {
                    const { opt, probabilityPct: displayPct } = entry;
                    const accent =
                      MULTI_OUTCOME_ACCENT_CLASSES[
                        index % MULTI_OUTCOME_ACCENT_CLASSES.length
                      ];
                    return (
                    <div
                      key={opt.key}
                      className={`min-w-0 flex h-full items-center justify-between rounded-xl border bg-black/20 px-2.5 py-1 overflow-hidden backdrop-blur-[1px] ${accent.border}`}
                    >
                      <span
                        className={`text-[11px] sm:text-xs font-semibold truncate leading-tight ${accent.label}`}
                        title={opt.label}
                      >
                        {opt.label}
                      </span>
                      <span className="ml-2 shrink-0 font-kalshi text-[13px] sm:text-sm font-semibold tabular-nums text-white/95">
                        {displayPct}%
                      </span>
                    </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </>
          ) : teams && !isMultiOutcome ? (
            /* Variante binaria Calcio: verde = % maggiore, rosso = % minore (pari: indifferente) */
            <>
              <div className="flex-1 flex flex-col justify-center items-center min-h-0 gap-3 w-full min-w-0 overflow-hidden">
                {topRightLabel && (
                  <span className="text-[10px] sm:text-xs font-semibold text-white/80 text-center shrink-0">
                    {topRightLabel}
                  </span>
                )}
                <h3
                  className={`font-semibold text-white/95 tracking-wide text-center shrink-0 ${compact ? "text-sm sm:text-base" : "text-base sm:text-lg"}`}
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.8)" }}
                >
                  Chi vincerà?
                </h3>
                <div className="w-full min-w-0 grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-2 items-stretch">
                  <div className={`min-w-0 flex flex-col py-2.5 px-2 sm:px-3 rounded-xl border-2 bg-transparent overflow-hidden min-h-[52px] sm:min-h-[56px] ${yesPct >= noPct ? "border-emerald-400" : "border-rose-500"}`}>
                    <span className="text-[11px] sm:text-sm font-medium text-white/95 break-words text-center leading-tight line-clamp-2 flex-1 flex items-center justify-center" title={teams.teamA}>
                      {teams.teamA}
                    </span>
                    <span className={`text-base sm:text-lg font-extrabold font-chubby tabular-nums mt-1 text-center shrink-0 ${yesPct >= noPct ? "text-emerald-400" : "text-rose-500"}`}>
                      {yesPct}%
                    </span>
                  </div>
                  <span className="flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white/50 uppercase tracking-wider shrink-0 px-0.5">
                    vs
                  </span>
                  <div className={`min-w-0 flex flex-col py-2.5 px-2 sm:px-3 rounded-xl border-2 bg-transparent overflow-hidden min-h-[52px] sm:min-h-[56px] ${noPct > yesPct ? "border-emerald-400" : "border-rose-500"}`}>
                    <span className="text-[11px] sm:text-sm font-medium text-white/95 break-words text-center leading-tight line-clamp-2 flex-1 flex items-center justify-center" title={teams.teamB}>
                      {teams.teamB}
                    </span>
                    <span className={`text-base sm:text-lg font-extrabold font-chubby tabular-nums mt-1 text-center shrink-0 ${noPct > yesPct ? "text-emerald-400" : "text-rose-500"}`}>
                      {noPct}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Variante generica: titolo + barra SÌ/NO */
            <>
              <h3
                className={`font-kalshi font-semibold leading-[1.15] tracking-[0.01em] break-words text-white mb-2 ${titleClampClass} ${titleSizeClass}`}
                style={{ textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {displayTitle}
              </h3>
              <div className={`mt-auto w-full ${binaryResponseAreaClass} flex flex-col justify-end pt-4 sm:pt-6`}>
                <div className="grid grid-rows-2 gap-1.5">
                  <div className="flex min-h-[36px] items-center justify-between rounded-2xl border border-emerald-400/75 bg-black/20 px-3.5 py-1.5 backdrop-blur-[1px]">
                    <span className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                      SI
                    </span>
                    <span className="font-kalshi text-base sm:text-lg font-semibold tabular-nums text-white/95">
                      {yesPct}%
                    </span>
                  </div>
                  <div className="flex min-h-[36px] items-center justify-between rounded-2xl border border-rose-500/80 bg-black/20 px-3.5 py-1.5 backdrop-blur-[1px]">
                    <span className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                      NO
                    </span>
                    <span className="font-kalshi text-base sm:text-lg font-semibold tabular-nums text-white/95">
                      {noPct}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
