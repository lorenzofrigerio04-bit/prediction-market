"use client";

import Link from "next/link";
import { getCategoryImagePath } from "@/lib/category-slug";
import { getCategoryIcon } from "@/lib/category-icons";

export interface LandingEventRowEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string | Date;
  probability: number;
  fomo?: { countdownMs: number };
}

function getTimeRemaining(closesAt: string | Date, countdownMs?: number): string {
  const timeUntilClose = countdownMs !== undefined ? countdownMs : new Date(closesAt).getTime() - Date.now();
  if (timeUntilClose <= 0) return "Chiuso";
  const hours = Math.floor(timeUntilClose / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}g ${hours % 24}h`;
  if (hours > 0) return `${hours} ore`;
  const minutes = Math.floor(timeUntilClose / (1000 * 60));
  return minutes > 0 ? `${minutes} min` : "Presto";
}

export default function LandingEventRow({ event }: { event: LandingEventRowEvent }) {
  const timeLabel = getTimeRemaining(event.closesAt, event.fomo?.countdownMs);
  const yesPct = Math.round(event.probability ?? 50);
  const noPct = 100 - yesPct;
  const bgImage = getCategoryImagePath(event.category);

  return (
    <Link
      href={`/events/${event.id}`}
      className="landing-event-row landing-event-row--has-bg relative block min-h-[160px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none"
    >
      <div
        className="landing-event-row__bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        aria-hidden
      />
      <div className="landing-event-row__overlay absolute inset-0 bg-black/50 dark:bg-black/60" aria-hidden />
      <div className="landing-event-row__content relative z-10 p-5 md:p-6 flex flex-col min-h-[140px] justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 shrink-0 min-w-0 px-2.5 py-1.5 rounded-xl text-ds-caption font-semibold bg-white/20 backdrop-blur-sm border border-white/20 text-white">
            <span className="[&>svg]:w-4 [&>svg]:h-4 shrink-0">{getCategoryIcon(event.category)}</span>
            <span className="truncate">{event.category}</span>
          </span>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-ds-caption font-bold font-numeric bg-black/40 text-white border border-white/20">
            {timeLabel}
          </span>
        </div>
        <h3 className="text-ds-h3 font-bold text-white mb-3 line-clamp-2 leading-snug drop-shadow-md">
          {event.title}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${yesPct}%` }}
            />
          </div>
          <span className="text-ds-body-sm font-bold font-numeric text-white tabular-nums shrink-0 drop-shadow-md">
            Sì {yesPct}%
          </span>
        </div>
      </div>
    </Link>
  );
}
