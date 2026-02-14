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
      Sport: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Politica: "bg-sky-100 text-sky-800 border-sky-200",
      Tecnologia: "bg-violet-100 text-violet-800 border-violet-200",
      Economia: "bg-amber-100 text-amber-800 border-amber-200",
      Cultura: "bg-pink-100 text-pink-800 border-pink-200",
      Altro: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return colors[category] || colors.Altro;
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="block focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 rounded-2xl outline-none"
    >
      <article className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 md:p-6 border border-slate-100 h-full flex flex-col group">
        {/* Top: categoria + scadenza */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryColor(event.category)}`}
          >
            {event.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg font-medium shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getTimeRemaining()}
          </span>
        </div>

        {/* Titolo - leggibile su mobile */}
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-accent-600 transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed flex-grow">
            {event.description}
          </p>
        )}

        {/* Probabilità - blocco chiaro */}
        <div className="mb-4 bg-gradient-to-br from-accent-50 to-sky-50 rounded-xl p-4 border border-accent-100/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Previsione
            </span>
            <span className="text-2xl md:text-3xl font-extrabold text-accent-600">
              {event.probability.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-400 to-accent-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(0, Math.min(100, event.probability))}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 mt-1.5 font-medium">
            <span className="text-accent-700 font-bold">{event.probability.toFixed(0)}%</span> SÌ
          </p>
        </div>

        {/* Stats - una riga compatta su mobile */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-slate-50 rounded-xl py-2.5 px-2">
              <div className="text-lg md:text-xl font-bold text-slate-900">
                {event._count.predictions}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wide">
                Previsioni
              </div>
            </div>
            <div className="text-center bg-slate-50 rounded-xl py-2.5 px-2">
              <div className="text-lg md:text-xl font-bold text-slate-900">
                {event._count.comments}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wide">
                Commenti
              </div>
            </div>
            <div className="text-center bg-accent-50 rounded-xl py-2.5 px-2 border border-accent-100">
              <div className="text-base md:text-lg font-bold text-accent-700">
                {event.totalCredits > 0 ? (event.totalCredits / 1000).toFixed(1) + "k" : "0"}
              </div>
              <div className="text-[10px] md:text-xs text-accent-600 font-medium uppercase tracking-wide">
                Crediti
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
