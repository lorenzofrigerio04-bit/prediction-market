"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { IconClock } from "@/components/ui/Icons";

export interface EventCardEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string | Date;
  probability: number;
  totalCredits: number;
  _count: {
    predictions: number;
    comments: number;
  };
}

interface EventCardProps {
  event: EventCardEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const timeUntilClose = new Date(event.closesAt).getTime() - Date.now();
  const hoursUntilClose = Math.floor(timeUntilClose / (1000 * 60 * 60));
  const daysUntilClose = Math.floor(hoursUntilClose / 24);

  const getTimeRemaining = () => {
    if (timeUntilClose <= 0) return "Chiuso";
    if (daysUntilClose > 0) return `${daysUntilClose}d`;
    if (hoursUntilClose > 0) return `${hoursUntilClose}h`;
    return "Presto";
  };

  const timeVariant = timeUntilClose <= 0 ? "default" : hoursUntilClose < 24 ? "scadenza" : "default";

  return (
    <Link
      href={`/events/${event.id}`}
      className="block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-3xl outline-none"
    >
      <article className="glass rounded-3xl border border-border dark:border-white/10 transition-all duration-ds-normal ease-ds-ease p-5 md:p-6 h-full flex flex-col group hover:border-primary/20 hover:shadow-glow-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="default" className="!bg-surface/80 !text-text-secondary !border-border dark:!border-white/10">
            {event.category}
          </Badge>
          <Badge variant={timeVariant}>
            <span className="inline-flex items-center gap-1.5 font-numeric">
              <IconClock className="w-3.5 h-3.5" />
              {getTimeRemaining()}
            </span>
          </Badge>
        </div>

        <h3 className="text-ds-h3 font-bold text-fg mb-2 line-clamp-2 leading-snug tracking-title group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed flex-grow">
            {event.description}
          </p>
        )}

        <div className="mb-4 glass-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Previsione
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-primary font-numeric">
              {event.probability.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface/50 rounded-full overflow-hidden border border-border dark:border-white/10">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500 shadow-glow-sm"
              style={{ width: `${Math.max(0, Math.min(100, event.probability))}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1.5 font-medium">
            <span className="text-primary font-bold">{event.probability.toFixed(0)}%</span> SÌ
          </p>
        </div>

        <div className="pt-4 border-t border-border dark:border-white/10">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center glass rounded-xl py-2.5 px-2 border border-border dark:border-white/10">
              <div className="text-lg md:text-xl font-bold text-fg font-numeric">
                {event._count.predictions}
              </div>
              <div className="text-ds-caption text-text-muted font-semibold uppercase tracking-label">
                Previsioni
              </div>
            </div>
            <div className="text-center glass rounded-xl py-2.5 px-2 border border-border dark:border-white/10">
              <div className="text-lg md:text-xl font-bold text-fg font-numeric">
                {event._count.comments}
              </div>
              <div className="text-ds-caption text-text-muted font-semibold uppercase tracking-label">
                Commenti
              </div>
            </div>
            <div className="text-center glass-elevated rounded-xl py-2.5 px-2">
              <div className="text-base md:text-lg font-bold text-primary font-numeric">
                {event.totalCredits > 0 ? (event.totalCredits / 1000).toFixed(1) + "k" : "0"}
              </div>
              <div className="text-ds-caption text-primary font-semibold uppercase tracking-label">
                Crediti
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
