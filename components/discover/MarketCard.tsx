"use client";

import { memo } from "react";
import Link from "next/link";
import { getCategoryIcon } from "@/lib/category-icons";

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
  const yesPct = event.totalCredits > 0
    ? Math.round((event.yesCredits / event.totalCredits) * 100)
    : Math.round(event.probability);
  const noPct = 100 - yesPct;

  const ctaLabel = event.resolved ? "Vedi risultato" : "Fai la tua previsione";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-2xl md:rounded-3xl outline-none"
    >
      <article
        className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border dark:border-white/10 glass p-4 md:p-5 h-full flex flex-col transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-[0_0_24px_-4px_rgba(var(--primary-glow),0.2)] animate-feed-in opacity-0"
        style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 shrink-0 min-w-0 px-2.5 py-1 rounded-xl text-ds-caption font-semibold bg-surface/60 dark:bg-white/5 text-fg-muted border border-border dark:border-white/10">
          <span className="text-primary shrink-0 [&>svg]:shrink-0">
            {getCategoryIcon(event.category)}
          </span>
          <span className="truncate">{event.category}</span>
        </span>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-ds-caption font-bold ${
            timeUntilClose <= 0
              ? "bg-fg-subtle/20 text-fg-muted"
              : isUrgent
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-surface/60 dark:bg-white/5 text-fg-muted border border-border dark:border-white/10"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {getTimeRemaining()}
        </span>
      </div>

      <h3 className="text-base md:text-lg font-bold text-fg leading-snug line-clamp-2 mb-4 flex-grow group-hover:text-primary transition-colors">
        {event.title}
      </h3>

      {/* Mini-grafico SI/NO + percentuali community */}
      <div className="mb-4">
        <div className="flex justify-between text-ds-body-sm font-semibold mb-1.5">
          <span className="text-emerald-600 dark:text-emerald-400">SÌ {yesPct}%</span>
          <span className="text-rose-500 dark:text-rose-400">NO {noPct}%</span>
        </div>
        <div className={`h-2.5 w-full rounded-full overflow-hidden flex bg-surface/50 dark:bg-white/5 border border-border dark:border-white/10 ${!event.resolved ? "animate-bar-pulse" : ""}`}>
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${yesPct}%` }}
          />
          <div
            className="h-full bg-rose-500 dark:bg-rose-400 transition-all duration-500 ease-out"
            style={{ width: `${noPct}%` }}
          />
        </div>
        <p className="text-ds-caption text-fg-muted mt-1">
          {event._count.predictions} previsioni · {event.totalCredits > 0 ? (event.totalCredits / 1000).toFixed(1) + "k" : "0"} crediti
        </p>
      </div>

      <span className="mt-auto flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-3 rounded-xl font-semibold text-ds-body-sm bg-primary text-white border border-primary shadow-glow transition-all duration-200 group-hover:bg-primary-hover group-hover:shadow-glow-sm">
        {ctaLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </span>
    </article>
    </Link>
  );
}

export default memo(MarketCard);
