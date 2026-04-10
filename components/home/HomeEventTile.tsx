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
}

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
  predictionsCount,
  variant,
  resolved,
  onNavigate,
  compact = false,
  imageUrl,
  topRightLabel,
  marketType,
  outcomes,
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

  /** Titolo da mostrare: binario "Chi vincerà X vs Y?", multi-outcome domanda senza opzioni */
  const displayTitle = isMultiOutcome
    ? getEventDisplayTitle(title)
    : teams
      ? formatBinaryMatchTitle(teams)
      : title;

  const minH = compact ? "min-h-0" : "min-h-[175px] sm:min-h-[195px]";
  const pClass = compact ? "p-3 sm:p-3" : "p-4 sm:p-5";
  const flexFill = compact ? "flex-1 h-full min-h-0" : "";

  return (
    <Link
      href={`/events/${id}`}
      onClick={onNavigate}
      className={`home-event-tile group relative block ${minH} ${flexFill} overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.08)]`}
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
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-110 contrast-105"
          onError={() => setEventImageFailed(true)}
        />
      )}
      {!useEventImage && useCategoryImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoryImagePath}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-110 contrast-105"
          onError={() => setCategoryImageFailed(true)}
        />
      )}
      {/* Overlay scuro per leggibilità testo (ridotto per far risaltare la foto) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />
      <div className={`relative z-10 flex h-full flex-col justify-between ${pClass}`}>
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
        <div className={teams && !isMultiOutcome ? "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" : isMultiOutcome && outcomeOptions && outcomeOptions.length > 0 ? "flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" : ""}>
          {isMultiOutcome && outcomeOptions && outcomeOptions.length > 0 ? (
            /* Variante multi-outcome: data centrata, titolo centrato, opzioni in griglia 2x2 */
            <>
              <div className="flex-1 flex flex-col justify-center items-center min-h-0 gap-3 w-full min-w-0 overflow-hidden">
                {topRightLabel && (
                  <span className="text-[10px] sm:text-xs font-semibold text-white/80 text-center shrink-0">
                    {topRightLabel}
                  </span>
                )}
                <h3
                  className={`font-semibold text-white/95 tracking-wide text-center shrink-0 line-clamp-2 ${compact ? "text-sm sm:text-base" : "text-base sm:text-ds-body"}`}
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.8)" }}
                >
                  {displayTitle}
                </h3>
                <div className="w-full min-w-0 grid grid-cols-2 gap-1.5 sm:gap-2">
                  {outcomeOptions.map((opt) => (
                    <div
                      key={opt.key}
                      className="min-w-0 flex items-center justify-center py-2 px-2 sm:px-3 rounded-lg border border-white/10 bg-white/[0.04] overflow-hidden"
                    >
                      <span className="text-[11px] sm:text-sm font-medium text-white/90 truncate text-center w-full" title={opt.label}>
                        {opt.label}
                      </span>
                    </div>
                  ))}
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
              <h3 className={`line-clamp-2 font-semibold leading-snug text-white ${compact ? "mb-1 text-xs sm:text-xs" : "mb-2 text-sm sm:text-ds-body-sm"}`} style={{ textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" }}>
                {displayTitle}
              </h3>
              {variant === "popular" && predictionsCount != null && !compact && (
                <p className="mb-1.5 text-xs font-medium text-white sm:text-ds-micro" style={{ textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,0.8)" }}>
                  {predictionsCount} previsioni
                </p>
              )}
              <div
                className="flex h-2 w-full overflow-hidden rounded-full bg-black/50 shadow-inner backdrop-blur-[1px]"
                role="presentation"
              >
                <div
                  className="h-full shrink-0 rounded-l-full transition-all duration-500"
                  style={{
                    width: `${yesPct}%`,
                    background: "linear-gradient(90deg, rgb(20 148 132) 0%, rgb(13 148 136) 100%)",
                  }}
                />
                <div
                  className="h-full shrink-0 rounded-r-full transition-all duration-500"
                  style={{
                    width: `${noPct}%`,
                    background: "linear-gradient(90deg, rgb(239 68 68) 0%, rgb(244 63 94) 100%)",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
