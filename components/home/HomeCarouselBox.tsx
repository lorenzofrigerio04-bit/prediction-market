"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import HomeEventTile, { type HomeEventTileVariant } from "./HomeEventTile";
import { LoadingBlock } from "@/components/ui";
import {
  deriveOutcomesFromTitle,
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";

export interface HomeEventTileData {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
  aiImageUrl?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
}

interface HomeCarouselBoxProps {
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  events: HomeEventTileData[];
  loading: boolean;
  variant: HomeEventTileVariant;
  onEventNavigate?: () => void;
}

const STAGGER_MS = 80;

function isMultiOutcomeTile(event: HomeEventTileData): boolean {
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

export default function HomeCarouselBox({
  title,
  viewAllHref,
  viewAllLabel = "Vedi tutti",
  events,
  loading,
  variant,
  onEventNavigate,
}: HomeCarouselBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const prevEventsLenRef = useRef(0);

  // Quando abbiamo eventi e non stiamo caricando, anima sempre la comparsa (così al ritorno in home si vedono)
  useEffect(() => {
    if (loading || events.length === 0) return;
    const count = events.length;
    const isNewData = count !== prevEventsLenRef.current;
    prevEventsLenRef.current = count;
    if (isNewData) queueMicrotask(() => setVisibleIndices(new Set()));

    const t = setTimeout(() => {
      events.forEach((_, index) => {
        setTimeout(() => {
          setVisibleIndices((prev) => new Set([...prev, index]));
        }, index * STAGGER_MS);
      });
    }, 50);
    return () => clearTimeout(t);
  }, [loading, events, events.length]);

  return (
    <section className="py-2 sm:py-2.5" aria-label={title}>
      <div className="mb-2.5 flex items-center justify-between gap-3 flex-wrap sm:mb-3">
        <h2 className="font-kalshi font-bold text-fg leading-[1.1] tracking-[0.01em] text-[1.65rem] sm:text-[2rem] md:text-[2.35rem]">
          {title}
        </h2>
        <Link
          href={viewAllHref}
          className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline shrink-0"
        >
          {viewAllLabel} →
        </Link>
      </div>
      {loading ? (
        <LoadingBlock message="Caricamento…" fullscreen={false} />
      ) : events.length === 0 ? (
        <p className="py-4 text-ds-body-sm text-fg-muted">Nessun evento al momento.</p>
      ) : (
        <div ref={containerRef} className="grid grid-cols-2 gap-1 sm:gap-1.5">
          {events.map((event, index) => {
            const isVisible = visibleIndices.has(index);
            return (
              <div
                key={event.id}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                  transition: `opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              >
                <HomeEventTile
                  id={event.id}
                  title={event.title}
                  category={event.category}
                  closesAt={event.closesAt}
                  yesPct={event.yesPct}
                  predictionsCount={event.predictionsCount}
                  variant={variant}
                  onNavigate={onEventNavigate}
                  compact={isMultiOutcomeTile(event)}
                  imageUrl={event.aiImageUrl}
                  marketType={event.marketType}
                  outcomes={event.outcomes}
                  outcomeProbabilities={event.outcomeProbabilities}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
