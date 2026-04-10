"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import HomeEventTile from "./HomeEventTile";
import { EmptyState, LoadingBlock } from "@/components/ui";
import { getCategoryFallbackGradient } from "@/lib/category-slug";
import {
  deriveOutcomesFromTitle,
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";

export interface HomeUnifiedFeedProps {
  onEventNavigate?: () => void;
  endpoint?: string;
  featuredTitle?: string;
  feedTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}
const HOME_UNIFIED_REFRESH_MS = 30_000;

interface UnifiedHomeEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
  totalCredits?: number;
  aiImageUrl?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
}

function isMultiOutcomeTile(event: UnifiedHomeEvent): boolean {
  const hasMultiOptionType =
    !!event.marketType &&
    isMarketTypeId(event.marketType) &&
    MULTI_OPTION_MARKET_TYPES.includes(event.marketType);
  if (hasMultiOptionType) return true;
  const parsedOutcomes =
    parseOutcomesJson(event.outcomes) ??
    (deriveOutcomesFromTitle(event.title).length > 0
      ? deriveOutcomesFromTitle(event.title)
      : null);
  return !!parsedOutcomes && parsedOutcomes.length > 2;
}

type LayoutEvent = UnifiedHomeEvent & { isMultiOutcome: boolean };

function softAlternateByShape(items: LayoutEvent[], lookahead = 4): LayoutEvent[] {
  const out = [...items];
  for (let i = 1; i < out.length; i += 1) {
    if (out[i].isMultiOutcome !== out[i - 1].isMultiOutcome) continue;
    const swapIndex = out.findIndex(
      (candidate, idx) =>
        idx > i &&
        idx <= i + lookahead &&
        candidate.isMultiOutcome !== out[i - 1].isMultiOutcome
    );
    if (swapIndex > i) {
      [out[i], out[swapIndex]] = [out[swapIndex], out[i]];
    }
  }
  return out;
}

function balanceRowsByShape(items: LayoutEvent[], lookahead = 8): LayoutEvent[] {
  const out = [...items];
  for (let rowStart = 0; rowStart < out.length - 1; rowStart += 2) {
    const first = out[rowStart];
    const second = out[rowStart + 1];
    if (!first || !second) break;
    if (first.isMultiOutcome !== second.isMultiOutcome) continue;

    let swapIndex = -1;
    for (
      let idx = rowStart + 2;
      idx < out.length && idx <= rowStart + 1 + lookahead;
      idx += 1
    ) {
      if (out[idx].isMultiOutcome !== first.isMultiOutcome) {
        swapIndex = idx;
        break;
      }
    }

    if (swapIndex >= 0) {
      [out[rowStart + 1], out[swapIndex]] = [out[swapIndex], out[rowStart + 1]];
    }
  }
  return out;
}

function formatCredits(value?: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;
  return safe.toLocaleString("it-IT");
}

interface TopFeaturedCardProps {
  event: UnifiedHomeEvent;
  generatedCover: string;
  onEventNavigate?: () => void;
}

function TopFeaturedCard({ event, generatedCover, onEventNavigate }: TopFeaturedCardProps) {
  const fallbackGradient = getCategoryFallbackGradient(event.category);
  const initialImage = event.aiImageUrl?.trim() || generatedCover;
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage);
  const [pressed, setPressed] = useState(false);

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onEventNavigate}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={`group relative block w-full overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 aspect-[10/7] will-change-transform transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        pressed
          ? "scale-[1.02] -translate-y-[1px] shadow-[0_14px_42px_rgba(0,0,0,0.38)]"
          : "shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pressed ? "scale-110" : "scale-100 group-hover:scale-105"
        }`}
        style={{ background: fallbackGradient }}
      />
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pressed ? "scale-110" : "scale-100 group-hover:scale-105"
          }`}
          onError={() => {
            if (imageSrc !== generatedCover) {
              setImageSrc(generatedCover);
              return;
            }
            setImageSrc(null);
          }}
        />
      )}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          pressed ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(120% 70% at 15% 0%, rgba(10,194,133,0.22) 0%, rgba(10,194,133,0) 55%), radial-gradient(90% 55% at 85% 100%, rgba(96,165,250,0.18) 0%, rgba(96,165,250,0) 60%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/58 to-black/35" />
      <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
        <h3
          className="font-kalshi font-bold text-white leading-[1.08] tracking-[0.01em] text-[1.5rem] sm:text-[1.85rem] md:text-[2.1rem] line-clamp-3"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}
        >
          {event.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-white/90 text-xs sm:text-sm font-medium">
          <span>{event.predictionsCount ?? 0} previsioni</span>
          <span className="h-1 w-1 rounded-full bg-white/65" aria-hidden />
          <span className="tabular-nums">₵ {formatCredits(event.totalCredits)}</span>
          <span className="h-1 w-1 rounded-full bg-white/65" aria-hidden />
          <span className="rounded-md border-[0.75px] border-white/75 px-1.5 py-[1px] leading-none text-white">
            {event.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomeUnifiedFeed({
  onEventNavigate,
  endpoint = "/api/feed/home-unified",
  featuredTitle = "Top 5 eventi delle ultime 24h",
  feedTitle = "Eventi popolari",
  emptyTitle = "Nessun evento",
  emptyDescription = "Non ci sono ancora eventi in questa sezione.",
}: HomeUnifiedFeedProps) {
  const [events, setEvents] = useState<UnifiedHomeEvent[]>([]);
  const [featuredEventsApi, setFeaturedEventsApi] = useState<UnifiedHomeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("Errore di caricamento");
      const data = await res.json();
      setEvents((data.events ?? []) as UnifiedHomeEvent[]);
      setFeaturedEventsApi((data.featuredEvents ?? []) as UnifiedHomeEvent[]);
    } catch {
      if (!silent) {
        setEvents([]);
        setFeaturedEventsApi([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      fetchFeed(true);
    }, HOME_UNIFIED_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchFeed]);

  const arrangedEvents = useMemo(() => {
    const base = events.map((event) => ({
      ...event,
      isMultiOutcome: isMultiOutcomeTile(event),
    }));
    const alternated = softAlternateByShape(base);
    return balanceRowsByShape(alternated);
  }, [events]);

  const featuredEvents = useMemo(
    () => (featuredEventsApi.length > 0 ? featuredEventsApi : events.slice(0, 5)),
    [events, featuredEventsApi]
  );
  const featuredIds = useMemo(
    () => new Set(featuredEvents.map((event) => event.id)),
    [featuredEvents]
  );
  const feedEvents = useMemo(
    () => arrangedEvents.filter((event) => !featuredIds.has(event.id)),
    [arrangedEvents, featuredIds]
  );

  if (loading) {
    return <LoadingBlock message="Caricamento eventi…" />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <section aria-label="Feed personalizzato">
      <div className="mb-5 sm:mb-6">
          <h2 className="mb-4 sm:mb-5 text-left font-kalshi font-bold text-white/95 leading-[0.98] tracking-[0.01em] text-[1.55rem] sm:text-[1.9rem] md:text-[2.15rem]">
            {featuredTitle}
          </h2>
          <div className="flex flex-col gap-3 sm:gap-4">
          {featuredEvents.map((event, idx) => {
            const generatedCover = `/top24h-cover-${(idx % 5) + 1}.svg`;
            return (
              <TopFeaturedCard
                key={event.id}
                event={event}
                generatedCover={generatedCover}
                onEventNavigate={onEventNavigate}
              />
            );
          })}
          </div>
      </div>

      <div className="pt-2 sm:pt-3 border-t border-white/10">
        <h2 className="font-kalshi font-bold text-fg leading-[1.1] tracking-[0.01em] text-[1.5rem] sm:text-[1.85rem] md:text-[2.1rem] mb-3 sm:mb-4">
          {feedTitle}
        </h2>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {feedEvents.map((event) => (
              <HomeEventTile
                key={event.id}
                id={event.id}
                title={event.title}
                category={event.category}
                closesAt={event.closesAt}
                yesPct={event.yesPct}
                predictionsCount={event.predictionsCount}
                variant="popular"
                onNavigate={onEventNavigate}
                compact={event.isMultiOutcome}
                imageUrl={event.aiImageUrl}
                marketType={event.marketType}
                outcomes={event.outcomes}
                outcomeProbabilities={event.outcomeProbabilities}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
