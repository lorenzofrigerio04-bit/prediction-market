"use client";

import Link from "next/link";

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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sport: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      Politica: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      Tecnologia: "bg-violet-500/20 text-violet-400 border-violet-500/30",
      Economia: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      Cultura: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      Altro: "bg-surface/50 text-fg-muted border-border dark:border-white/10",
    };
    return colors[category] || colors.Altro;
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="block focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-3xl outline-none"
    >
      <article className="glass rounded-3xl border border-border dark:border-white/10 transition-all duration-300 p-5 md:p-6 h-full flex flex-col group hover:border-primary/20 hover:shadow-glow-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold border ${getCategoryColor(event.category)}`}
          >
            {event.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-fg-muted bg-surface/50 border border-border dark:border-white/10 px-2.5 py-1.5 rounded-xl font-medium shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeRemaining()}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-fg mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-fg-muted mb-4 line-clamp-2 leading-relaxed flex-grow">
            {event.description}
          </p>
        )}

        <div className="mb-4 glass-elevated rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-fg-muted uppercase tracking-wider">
              Previsione
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-primary">
              {event.probability.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface/50 rounded-full overflow-hidden border border-border dark:border-white/10">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500 shadow-glow-sm"
              style={{ width: `${Math.max(0, Math.min(100, event.probability))}%` }}
            />
          </div>
          <p className="text-xs text-fg-muted mt-1.5 font-medium">
            <span className="text-primary font-bold">{event.probability.toFixed(0)}%</span> SÌ
          </p>
        </div>

        <div className="pt-4 border-t border-border dark:border-white/10">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center glass rounded-xl py-2.5 px-2 border border-border dark:border-white/10">
              <div className="text-lg md:text-xl font-bold text-fg">
                {event._count.predictions}
              </div>
              <div className="text-[10px] md:text-xs text-fg-muted font-medium uppercase tracking-wide">
                Previsioni
              </div>
            </div>
            <div className="text-center glass rounded-xl py-2.5 px-2 border border-border dark:border-white/10">
              <div className="text-lg md:text-xl font-bold text-fg">
                {event._count.comments}
              </div>
              <div className="text-[10px] md:text-xs text-fg-muted font-medium uppercase tracking-wide">
                Commenti
              </div>
            </div>
            <div className="text-center glass-elevated rounded-xl py-2.5 px-2">
              <div className="text-base md:text-lg font-bold text-primary">
                {event.totalCredits > 0 ? (event.totalCredits / 1000).toFixed(1) + "k" : "0"}
              </div>
              <div className="text-[10px] md:text-xs text-primary font-medium uppercase tracking-wide">
                Crediti
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
