"use client";

import { memo } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";
import { IconClock, IconArrowRight } from "@/components/ui/Icons";
import { getEventProbability } from "@/lib/pricing/price-display";

export interface MarketCardEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string | Date;
  probability: number;
  yesCredits: number;
  noCredits: number;
  totalCredits: number;
  resolved: boolean;
  outcome?: string | null;
  // LMSR fields (optional for backward compatibility)
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
  _count: {
    predictions: number;
    comments: number;
  };
}

interface MarketCardProps {
  event: MarketCardEvent;
  index?: number;
}

function MarketCard({ event, index = 0 }: MarketCardProps) {
  const closesAt = new Date(event.closesAt);
  const timeUntilClose = closesAt.getTime() - Date.now();
  const hoursUntilClose = Math.floor(timeUntilClose / (1000 * 60 * 60));
  const daysUntilClose = Math.floor(hoursUntilClose / 24);

  const getTimeRemaining = (): string => {
    if (timeUntilClose <= 0) return "Chiuso";
    if (daysUntilClose > 0) return `${daysUntilClose}g`;
    if (hoursUntilClose > 0) return `${hoursUntilClose}h`;
    return "<1h";
  };

  const isUrgent = timeUntilClose > 0 && timeUntilClose < 24 * 60 * 60 * 1000;
  
  // Sempre LMSR: percentuale da q_yes, q_no, b (0/0 → 50%)
  const qYes = event.q_yes ?? 0;
  const qNo = event.q_no ?? 0;
  const b = event.b ?? 100;
  const yesPct = b > 0 ? Math.round(getEventProbability({ q_yes: qYes, q_no: qNo, b })) : 50;
  const noPct = 100 - yesPct;

  const ctaLabel = event.resolved ? "Vedi risultato" : "Fai la tua previsione";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-2xl md:rounded-3xl outline-none"
    >
      <article
        className="relative overflow-hidden rounded-2xl md:rounded-3xl box-raised hover-lift p-4 md:p-5 h-full flex flex-col transition-all duration-300 ease-out animate-feed-in opacity-0"
        style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 shrink-0 min-w-0 px-2.5 py-1 rounded-xl text-ds-caption font-semibold bg-surface/80 text-text-secondary border border-border dark:border-white/10">
          <span className="text-primary shrink-0 [&>svg]:shrink-0">
            {getCategoryIcon(event.category)}
          </span>
          <span className="truncate">{event.category}</span>
        </span>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-ds-caption font-bold font-numeric ${
            timeUntilClose <= 0
              ? "bg-surface/80 text-text-muted border border-border dark:border-white/10"
              : isUrgent
                ? "bg-warning-bg/90 text-warning border border-warning/30 dark:bg-warning-bg/50 dark:text-warning dark:border-warning/40"
                : "bg-surface/80 text-text-secondary border border-border dark:border-white/10"
          }`}
        >
          <IconClock className="w-3.5 h-3.5" />
          {getTimeRemaining()}
        </span>
      </div>

      <h3 className="text-ds-h3 font-bold text-fg leading-snug line-clamp-2 mb-4 flex-grow group-hover:text-primary transition-colors tracking-title">
        {event.title}
      </h3>

      {/* Mini-grafico SI/NO + percentuali community */}
      <div className="mb-4">
        <div className="flex justify-between text-ds-body-sm font-semibold mb-1.5 font-numeric">
          <span className="text-success">SÌ {yesPct}%</span>
          <span className="text-danger">NO {noPct}%</span>
        </div>
        <div className={`h-2.5 w-full rounded-full overflow-hidden flex bg-surface/80 border border-border dark:border-white/10 ${!event.resolved ? "animate-bar-pulse" : ""}`}>
          <div
            className="h-full bg-success transition-all duration-500 ease-out"
            style={{ width: `${yesPct}%` }}
          />
          <div
            className="h-full bg-danger transition-all duration-500 ease-out"
            style={{ width: `${noPct}%` }}
          />
        </div>
        <p className="text-ds-caption text-text-muted mt-1">
          {event._count.predictions} previsioni · {event.totalCredits > 0 ? (event.totalCredits / 1000).toFixed(1) + "k" : "0"} crediti
        </p>
      </div>

      <span className="mt-auto flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-3 rounded-xl font-semibold text-ds-body-sm bg-primary text-white border border-primary shadow-glow transition-all duration-200 group-hover:bg-primary-hover group-hover:shadow-glow-sm active:scale-[0.98]">
        {ctaLabel}
        <IconArrowRight className="w-4 h-4" />
      </span>
    </article>
    </Link>
  );
}

export default memo(MarketCard);
