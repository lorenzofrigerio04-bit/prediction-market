"use client";

import { useState } from "react";
import { getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";

export interface CreatedEventTileInRevisionProps {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  description?: string | null;
}

export default function CreatedEventTileInRevision({
  title,
  category,
  closesAt,
  description,
}: CreatedEventTileInRevisionProps) {
  const imagePath = getCategoryImagePath(category);
  const fallbackGradient = getCategoryFallbackGradient(category);
  const [imageFailed, setImageFailed] = useState(false);
  const useImage = imagePath && !imageFailed;

  return (
    <div
      className="home-event-tile group relative block min-h-[175px] overflow-hidden rounded-lg border-0 bg-transparent transition-all duration-300 sm:min-h-[195px]"
      role="article"
      aria-label={`${title} - In revisione`}
    >
      {/* Sfondo: stessa struttura di HomeEventTile */}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40" />
      <div className="relative z-10 flex h-full min-h-[175px] flex-col justify-between p-3 sm:min-h-[195px] sm:p-4">
        <div>
          <span className="inline-flex w-fit rounded-md border border-white/30 bg-black/70 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro">
            {category}
          </span>
        </div>
        <div>
          <h3
            className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-white sm:text-ds-body-sm"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" }}
          >
            {title}
          </h3>
          {description && description.trim() && (
            <p
              className="mb-2 line-clamp-1 text-xs text-white/90 sm:text-ds-micro"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,0.8)" }}
            >
              {description.trim()}
            </p>
          )}
          {/* Box Revisione con rotella (stessa altezza concettuale della barra Sì/No) */}
          <div className="flex h-9 items-center overflow-hidden rounded-lg border border-amber-400/50 bg-amber-500/20 shadow-[0_0_12px_-2px_rgba(251,191,36,0.3)]">
            <span className="inline-flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-amber-100 sm:text-ds-micro">
              <svg className="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              In revisione
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
