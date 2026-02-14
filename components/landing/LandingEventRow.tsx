"use client";

import Link from "next/link";

export interface LandingEventRowEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
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
  const yesPct = Math.round(event.probability);
  const noPct = 100 - yesPct;
  const timeLabel = getTimeRemaining(event.closesAt);
  const icon = getCategoryIcon(event.category);

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-2xl border border-border dark:border-white/10 glass p-4 transition-all duration-ds-normal ease-ds-ease hover:border-primary/20 hover:shadow-glow-sm focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-2 text-ds-micro font-semibold text-fg-muted shrink-0">
          <span aria-hidden>{icon}</span>
          {event.category}
        </span>
        <span className="text-ds-micro font-semibold text-fg-muted shrink-0">
          {timeLabel}
        </span>
      </div>
      <h3 className="text-ds-body font-bold text-fg line-clamp-2 leading-snug mb-3">
        {event.title}
      </h3>
      <div className="flex items-center gap-2 text-ds-body-sm text-fg-muted mb-3">
        <span className="font-semibold text-primary">{yesPct}%</span>
        <span>SÌ</span>
        <span className="text-fg-subtle">·</span>
        <span className="font-semibold">{noPct}%</span>
        <span>NO</span>
      </div>
      <div className="w-full h-2 rounded-full bg-surface/80 border border-border dark:border-white/10 overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${yesPct}%` }}
        />
      </div>
      <span className="inline-flex items-center justify-center min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-primary/15 text-primary font-semibold text-ds-body-sm border border-primary/30 ds-tap-target">
        Fai la tua previsione
      </span>
    </Link>
  );
}
