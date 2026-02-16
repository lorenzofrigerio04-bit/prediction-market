"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { IconClock, IconChat, IconCurrency, IconTrendUp } from "@/components/ui/Icons";
import { getEventProbability } from "@/lib/pricing/price-display";

export interface EventCardEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string | Date;
  probability: number;
  totalCredits: number;
  yesCredits?: number;
  noCredits?: number;
  // LMSR fields (optional for backward compatibility)
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
  _count: {
    predictions: number;
    comments: number;
  };
}

interface EventCardProps {
  event: EventCardEvent;
}

function useEventDerived(event: EventCardEvent) {
  return useMemo(() => {
    // Use LMSR price if available, otherwise fall back to probability
    let yesPct: number;
    if (event.q_yes !== null && event.q_yes !== undefined && 
        event.q_no !== null && event.q_no !== undefined && 
        event.b !== null && event.b !== undefined) {
      // Use LMSR price
      yesPct = Math.round(getEventProbability(event));
    } else {
      // Fallback to probability field or calculate from yesCredits/totalCredits
      const total = event.totalCredits || 0;
      const yes =
        typeof event.yesCredits === "number"
          ? event.yesCredits
          : total > 0
            ? Math.round((event.probability / 100) * total)
            : 0;
      yesPct = total > 0 ? Math.round((yes / total) * 100) : Math.round(event.probability);
    }
    
    const noPct = 100 - yesPct;
    const total = event.totalCredits || 0;
    const yes = typeof event.yesCredits === "number" ? event.yesCredits : Math.round((yesPct / 100) * total);
    const no = total - yes;
    const yesMultiplier = yes > 0 ? Math.max(1, total / yes) : 1;
    const noMultiplier = no > 0 ? Math.max(1, total / no) : 1;
    return { yesPct, noPct, yesMultiplier, noMultiplier };
  }, [event.totalCredits, event.yesCredits, event.noCredits, event.probability, event.q_yes, event.q_no, event.b]);
}

function getTimeRemaining(closesAt: string | Date): string {
  const timeUntilClose = new Date(closesAt).getTime() - Date.now();
  if (timeUntilClose <= 0) return "Chiuso";
  const hours = Math.floor(timeUntilClose / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}g ${hours % 24}h`;
  if (hours > 0) return `${hours} ore rimaste`;
  const minutes = Math.floor(timeUntilClose / (1000 * 60));
  return minutes > 0 ? `${minutes} min` : "Presto";
}

export default function EventCard({ event }: EventCardProps) {
  const { yesPct, noPct, yesMultiplier, noMultiplier } = useEventDerived(event);
  const timeLabel = getTimeRemaining(event.closesAt);
  const timeUntilClose = new Date(event.closesAt).getTime() - Date.now();
  const isUrgent = timeUntilClose > 0 && timeUntilClose < 24 * 60 * 60 * 1000;
  const isClosed = timeUntilClose <= 0;
  const higherMultiplierIsYes = yesMultiplier >= noMultiplier;

  return (
    <Link
      href={`/events/${event.id}`}
      className="block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-3xl outline-none"
    >
      <article className="card-neon-glass transition-all duration-ds-normal ease-ds-ease p-5 md:p-6 h-full flex flex-col group hover:shadow-[0_0_36px_-10px_rgba(var(--primary-glow),0.28)] active:scale-[0.995]">
        {/* HEADER: badge categoria + scadenza */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 shrink-0 min-w-0 px-2.5 py-1.5 rounded-xl text-ds-caption font-semibold bg-white/5 border border-white/10 text-fg">
            <span className="text-primary shrink-0 [&>svg]:w-4 [&>svg]:h-4">
              {getCategoryIcon(event.category)}
            </span>
            <span className="truncate">{event.category}</span>
          </span>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-ds-caption font-bold font-numeric ${
              isClosed
                ? "bg-white/5 text-fg-muted border border-white/10"
                : isUrgent
                  ? "bg-warning-bg/90 text-warning border border-warning/30 dark:bg-warning-bg/50 dark:text-warning dark:border-warning/40 dark:shadow-[0_0_14px_-2px_rgba(253,224,71,0.4)]"
                  : "bg-black/40 dark:bg-black/50 border border-primary/50 text-white shadow-[0_0_12px_-2px_rgba(var(--primary-glow),0.35)]"
            }`}
          >
            <IconClock className="w-4 h-4" aria-hidden />
            {timeLabel}
          </span>
        </div>

        <h3 className="text-ds-h2 font-bold text-fg mb-1 line-clamp-2 leading-snug tracking-title group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-ds-body-sm text-fg-muted mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        {/* BLOCCO PREVISIONE — SI / NO: gradienti soft, numeri integrati, barra LED */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-0 mb-3">
            {/* SINISTRA — SÌ: gradiente teal/verde, glow morbido */}
            <div className="prediction-block-si rounded-2xl rounded-tr-none rounded-br-none border border-r-0 p-3 md:p-4">
              <div className="prediction-num-si text-2xl md:text-3xl font-extrabold font-numeric tabular-nums">
                {yesPct}%
              </div>
              <div className="prediction-num-si text-ds-label font-bold uppercase tracking-label mt-0.5 opacity-90">
                SÌ
              </div>
              <div className="mt-2 text-ds-caption text-fg-muted font-medium">
                Moltiplicatore
              </div>
              <div
                className={`prediction-num-si text-xl md:text-2xl font-extrabold font-numeric tabular-nums mt-0.5 ${
                  higherMultiplierIsYes ? "opacity-100" : "opacity-80"
                }`}
              >
                ×{yesMultiplier.toFixed(2)}
              </div>
            </div>
            {/* DESTRA — NO: gradiente coral/rosso, glow morbido */}
            <div className="prediction-block-no rounded-2xl rounded-tl-none rounded-bl-none border border-l-0 p-3 md:p-4">
              <div className="prediction-num-no text-2xl md:text-3xl font-extrabold font-numeric tabular-nums">
                {noPct}%
              </div>
              <div className="prediction-num-no text-ds-label font-bold uppercase tracking-label mt-0.5 opacity-90">
                NO
              </div>
              <div className="mt-2 text-ds-caption text-fg-muted font-medium">
                Moltiplicatore
              </div>
              <div
                className={`prediction-num-no text-xl md:text-2xl font-extrabold font-numeric tabular-nums mt-0.5 ${
                  !higherMultiplierIsYes ? "opacity-100" : "opacity-80"
                }`}
              >
                ×{noMultiplier.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Barra centrale tipo LED: glow, bordi morbidi, riempimento fluido */}
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
              style={{ width: `${noPct}%` }}
            />
          </div>
          <p className="text-ds-caption text-fg-subtle mt-1.5 text-center">
            Moltiplicatore dinamico
          </p>
        </div>

        {/* CREDITI IN GIOCO — unico box nero bordo blu neon */}
        <div className="pill-credits-neon flex items-center justify-center gap-2 py-3 px-4 rounded-2xl mb-4">
          <IconCurrency className="w-5 h-5 text-primary shrink-0" aria-hidden />
          <span className="text-lg md:text-xl font-bold text-white font-numeric tabular-nums">
            {event.totalCredits.toLocaleString("it-IT")} CREDITI IN GIOCO
          </span>
        </div>

        {/* FOOTER: tre stat neon-mini */}
        <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t border-white/10">
          <div className="stat-neon-mini flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-center">
            <span className="text-base md:text-lg font-bold text-fg font-numeric tabular-nums">
              {event._count.predictions}
            </span>
            <span className="text-ds-caption text-fg-muted font-semibold uppercase tracking-label">
              Previsioni
            </span>
          </div>
          <div className="stat-neon-mini flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-center">
            <IconChat className="w-4 h-4 text-fg-muted mx-auto mb-0.5" aria-hidden />
            <span className="text-base md:text-lg font-bold text-fg font-numeric tabular-nums">
              {event._count.comments}
            </span>
            <span className="text-ds-caption text-fg-muted font-semibold uppercase tracking-label">
              Commenti
            </span>
          </div>
          <div className="stat-neon-mini flex flex-col items-center justify-center rounded-xl py-2.5 px-2 text-center">
            <IconTrendUp className="w-4 h-4 text-primary shrink-0 mx-auto mb-0.5" aria-hidden />
            <span className="text-base md:text-lg font-bold text-fg font-numeric tabular-nums">—</span>
            <span className="text-ds-caption text-fg-muted font-semibold uppercase tracking-label">
              Trend
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
