"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import HomeEventTile, { type HomeEventTileVariant } from "./HomeEventTile";
import { LoadingBlock } from "@/components/ui";

export interface HomeEventTileData {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
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
    if (isNewData) setVisibleIndices(new Set());

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
    <section className="py-4 sm:py-5" aria-label={title}>
      <div className="mb-3 flex items-center justify-between gap-3 flex-wrap sm:mb-4">
        <h2 className="text-ds-h2 font-bold text-fg">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline shrink-0"
        >
          {viewAllLabel} →
        </Link>
      </div>
      {loading ? (
        <LoadingBlock message="Caricamento…" />
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
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
