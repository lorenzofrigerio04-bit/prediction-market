"use client";

import Link from "next/link";
import { getEventProbability } from "@/lib/pricing/price-display";

export interface LandingEventRowEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  // LMSR fields (optional for backward compatibility)
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  Sport: "⚽",
  Tecnologia: "💻",
  Politica: "🏛️",
  Economia: "📈",
  Cultura: "🎭",
  Altro: "✨",
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] ?? "✨";
}

function getTimeRemaining(closesAt: string): string {
  const timeUntilClose = new Date(closesAt).getTime() - Date.now();
  if (timeUntilClose <= 0) return "Chiuso";
  const hours = Math.floor(timeUntilClose / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}g`;
  if (hours > 0) return `${hours}h`;
  return "Presto";
}

interface LandingEventRowProps {
  event: LandingEventRowEvent;
}

export default function LandingEventRow({ event }: LandingEventRowProps) {
  // Use LMSR price if available, otherwise fall back to probability
  let yesPct: number;
  if (event.q_yes !== null && event.q_yes !== undefined && 
      event.q_no !== null && event.q_no !== undefined && 
      event.b !== null && event.b !== undefined) {
    // Use LMSR price
    yesPct = Math.round(getEventProbability(event));
  } else {
    // Fallback to probability field
    yesPct = Math.round(event.probability);
  }
  const noPct = 100 - yesPct;
  const timeLabel = getTimeRemaining(event.closesAt);
  const icon = getCategoryIcon(event.category);
  const isPolitica = event.category === "Politica";

  return (
    <Link
      href={`/events/${event.id}`}
      className={`block rounded-2xl box-raised hover-lift p-4 md:p-5 transition-all duration-ds-normal ease-ds-ease focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none group relative overflow-hidden ${isPolitica ? "landing-event-row--politica" : ""}`}
    >
      {isPolitica && (
        <div className="landing-event-row__bg" aria-hidden />
      )}
      <div className="relative z-10">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-ds-micro font-semibold bg-white/5 dark:bg-black/40 border border-white/10 dark:border-primary/30 text-fg shrink-0">
          <span aria-hidden>{icon}</span>
          {event.category}
        </span>
        <span className="text-ds-micro font-bold font-numeric text-primary shrink-0">
          {timeLabel}
        </span>
      </div>
      <h3 className="text-ds-body font-bold text-fg line-clamp-2 leading-snug mb-3 group-hover:text-primary/90 transition-colors">
        {event.title}
      </h3>
      <div className="flex items-center gap-2 text-ds-body-sm text-fg-muted mb-3">
        <span className="font-semibold text-primary">{yesPct}%</span>
        <span>SÌ</span>
        <span className="text-fg-subtle">·</span>
        <span className="font-semibold">{noPct}%</span>
        <span>NO</span>
      </div>
      <div className="prediction-bar-led h-2.5 w-full flex rounded-full overflow-hidden mb-4" role="presentation" aria-hidden>
        <div
          className="prediction-bar-fill-si h-full shrink-0 rounded-full transition-all duration-500"
          style={{ width: `${yesPct}%` }}
        />
        <div
          className="prediction-bar-fill-no h-full shrink-0 rounded-full transition-all duration-500"
          style={{ width: `${noPct}%` }}
        />
      </div>
      <span className="inline-flex items-center justify-center min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-primary/20 text-primary font-semibold text-ds-body-sm border border-primary/40 shadow-[0_0_16px_-4px_rgba(var(--primary-glow),0.35)] hover:shadow-[0_0_20px_-4px_rgba(var(--primary-glow),0.45)] transition-shadow ds-tap-target">
        Fai la tua previsione
      </span>
      </div>
    </Link>
  );
}
