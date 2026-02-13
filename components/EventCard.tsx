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
    if (timeUntilClose <= 0) {
      return "Chiuso";
    }
    if (daysUntilClose > 0) {
      return `${daysUntilClose} ${daysUntilClose === 1 ? "giorno" : "giorni"}`;
    } else if (hoursUntilClose > 0) {
      return `${hoursUntilClose} ${hoursUntilClose === 1 ? "ora" : "ore"}`;
    } else {
      return "In scadenza";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Sport: "bg-green-100 text-green-800 border-green-200",
      Politica: "bg-blue-100 text-blue-800 border-blue-200",
      Tecnologia: "bg-purple-100 text-purple-800 border-purple-200",
      Economia: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Cultura: "bg-pink-100 text-pink-800 border-pink-200",
      Altro: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || colors.Altro;
  };

  return (
    <Link
      href={`/events/${event.id}`}
      className="block focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl outline-none"
    >
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-200 h-full flex flex-col group">
        {/* Header con categoria e scadenza */}
        <div className="flex items-center justify-between mb-5">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getCategoryColor(
              event.category
            )}`}
          >
            {event.category}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Chiude tra {getTimeRemaining()}</span>
          </div>
        </div>

        {/* Titolo */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {event.title}
        </h3>

        {/* Descrizione */}
        {event.description && (
          <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed flex-grow">
            {event.description}
          </p>
        )}

        {/* Sezione probabilità - più visibile e user-friendly */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Previsione della community
            </span>
            <span className="text-3xl font-extrabold text-blue-600">
              {event.probability.toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-4 bg-white/60 rounded-full overflow-hidden shadow-inner mb-2">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 transition-all duration-500 rounded-full shadow-sm"
              style={{ width: `${Math.max(0, Math.min(100, event.probability))}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 text-center font-medium">
            <span className="text-blue-700 font-bold">{event.probability.toFixed(0)}%</span> prevede <strong className="text-gray-900">SÌ</strong>
          </p>
        </div>

        {/* Statistiche - layout più chiaro e separato */}
        <div className="pt-5 border-t-2 border-gray-100">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center bg-gray-50 rounded-lg py-3 px-2">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {event._count.predictions}
              </div>
              <div className="text-xs text-gray-600 font-semibold">
                Previsioni
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded-lg py-3 px-2">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {event._count.comments}
              </div>
              <div className="text-xs text-gray-600 font-semibold">
                Commenti
              </div>
            </div>
            <div className="text-center bg-blue-50 rounded-lg py-3 px-2 border border-blue-100">
              <div className="text-xl font-bold text-blue-700 mb-1">
                {event.totalCredits > 0 ? (event.totalCredits / 1000).toFixed(1) + "k" : "0"}
              </div>
              <div className="text-xs text-blue-600 font-semibold">
                Crediti
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
