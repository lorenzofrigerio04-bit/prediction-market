"use client";

import { useState } from "react";
import Link from "next/link";
import { getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";

export type HomeEventTileVariant = "popular" | "closing" | "foryou";

export interface HomeEventTileProps {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
  variant: HomeEventTileVariant;
  onNavigate?: () => void;
}

function formatTimeLeftShort(closesAt: string): string {
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return "Chiuso";
  const h = Math.floor(ms / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

export default function HomeEventTile({
  id,
  title,
  category,
  closesAt,
  yesPct,
  predictionsCount,
  variant,
  onNavigate,
}: HomeEventTileProps) {
  const noPct = 100 - yesPct;
  const imagePath = getCategoryImagePath(category);
  const fallbackGradient = getCategoryFallbackGradient(category);
  const [imageFailed, setImageFailed] = useState(false);
  const useImage = imagePath && !imageFailed;

  return (
    <Link
      href={`/events/${id}`}
      onClick={onNavigate}
      className="home-event-tile group relative block min-h-[175px] overflow-hidden rounded-lg border-0 bg-transparent transition-all duration-300 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.99] sm:min-h-[195px]"
    >
      {/* Sfondo: img categoria (come pagina eventi/categorie), fallback gradiente se assente o errore */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{
          background: useImage ? undefined : fallbackGradient,
        }}
      />
      {useImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imagePath}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageFailed(true)}
        />
      )}
      {/* Overlay solo in basso per leggibilità testo, resto della foto visibile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 flex h-full min-h-[175px] flex-col justify-between p-3 sm:min-h-[195px] sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex rounded-md border border-white/30 bg-black/50 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_1px_4px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:text-ds-micro">
            {category}
          </span>
          {variant === "closing" && (
            <span className="shrink-0 rounded-lg border border-amber-400/50 bg-amber-500/30 px-2 py-1 text-xs font-bold text-amber-200 shadow-[0_0_12px_-2px_rgba(251,191,36,0.5)] sm:text-ds-micro">
              {formatTimeLeftShort(closesAt)}
            </span>
          )}
        </div>
        <div>
          <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,0.9)] sm:text-ds-body-sm">
            {title}
          </h3>
          {variant === "popular" && predictionsCount != null && (
            <p className="mb-1.5 text-xs font-medium text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] sm:text-ds-micro">
              {predictionsCount} previsioni
            </p>
          )}
          <div
            className="flex h-1.5 w-full overflow-hidden rounded-full bg-black/50 shadow-inner backdrop-blur-[1px]"
            role="presentation"
          >
            <div
              className="h-full shrink-0 rounded-l-full transition-all duration-500"
              style={{
                width: `${yesPct}%`,
                background: "linear-gradient(90deg, rgb(20 148 132) 0%, rgb(13 148 136) 100%)",
              }}
            />
            <div
              className="h-full shrink-0 rounded-r-full transition-all duration-500"
              style={{
                width: `${noPct}%`,
                background: "linear-gradient(90deg, rgb(239 68 68) 0%, rgb(244 63 94) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
