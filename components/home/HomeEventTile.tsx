"use client";

import { useState, useEffect } from "react";
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
  /** Se true, l’evento è risolto con esito */
  resolved?: boolean;
  onNavigate?: () => void;
  compact?: boolean;
  /** Foto AI generata per l'evento (da Post AI_IMAGE). Se presente, usata come sfondo invece della categoria. */
  imageUrl?: string | null;
}

function formatTimeLeftShort(closesAt: string, nowMs: number): string {
  if (nowMs <= 0) return "—";
  const ms = new Date(closesAt).getTime() - nowMs;
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
  resolved,
  onNavigate,
  compact = false,
  imageUrl,
}: HomeEventTileProps) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const update = () => setNow(Date.now());
    queueMicrotask(update);
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const noPct = 100 - yesPct;
  const categoryImagePath = getCategoryImagePath(category);
  const fallbackGradient = getCategoryFallbackGradient(category);
  const [aiImageFailed, setAiImageFailed] = useState(false);
  const [categoryImageFailed, setCategoryImageFailed] = useState(false);
  const useAiImage = imageUrl?.trim() && !aiImageFailed;
  const useCategoryImage = categoryImagePath && !categoryImageFailed && !useAiImage;
  const useImage = useAiImage || useCategoryImage;
  const closesAtMs = new Date(closesAt).getTime();
  const isClosedOrClosing = variant === "closing" || (now > 0 && closesAtMs <= now);

  const minH = compact ? "min-h-0" : "min-h-[175px] sm:min-h-[195px]";
  const pClass = compact ? "p-3 sm:p-3" : "p-4 sm:p-5";
  const flexFill = compact ? "flex-1 h-full min-h-0" : "";

  return (
    <Link
      href={`/events/${id}`}
      onClick={onNavigate}
      className={`home-event-tile group relative block ${minH} ${flexFill} overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/5 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:opacity-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.99] shadow-[0_2px_12px_rgba(0,0,0,0.08)]`}
    >
      {/* Sfondo: foto AI se disponibile, altrimenti img categoria, fallback gradiente */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{
          background: useImage ? undefined : fallbackGradient,
        }}
      />
      {useAiImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-110 contrast-105"
          onError={() => setAiImageFailed(true)}
        />
      )}
      {useCategoryImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={categoryImagePath}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-110 contrast-105"
          onError={() => setCategoryImageFailed(true)}
        />
      )}
      {/* Overlay scuro per leggibilità testo (ridotto per far risaltare la foto) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/30" />
      <div className={`relative z-10 flex h-full flex-col justify-between ${pClass}`}>
        <div className={variant === "closing" ? "flex flex-col items-start gap-1" : ""}>
          <span className="inline-flex w-fit rounded-xl border border-white/30 bg-black/60 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro">
            {category}
          </span>
          {isClosedOrClosing && (
            <span className="rounded-lg border border-amber-400/50 bg-amber-500/40 px-2 py-1 text-xs font-bold text-amber-100 shadow-[0_0_12px_-2px_rgba(251,191,36,0.5),0_1px_3px_rgba(0,0,0,0.8)] sm:text-ds-micro w-fit">
              {formatTimeLeftShort(closesAt, now)}
            </span>
          )}
        </div>
        <div>
          <h3 className={`line-clamp-2 font-semibold leading-snug text-white ${compact ? "mb-1 text-xs sm:text-xs" : "mb-2 text-sm sm:text-ds-body-sm"}`} style={{ textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" }}>
            {title}
          </h3>
          {variant === "popular" && predictionsCount != null && !compact && (
            <p className="mb-1.5 text-xs font-medium text-white sm:text-ds-micro" style={{ textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,0.8)" }}>
              {predictionsCount} previsioni
            </p>
          )}
          <div
            className="flex h-2 w-full overflow-hidden rounded-full bg-black/50 shadow-inner backdrop-blur-[1px]"
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
