"use client";

import type { FootballEvent } from "@/types/homepage";
import { HomeEventCard } from "./HomeEventCard";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
  accent?: "primary" | "gold" | "rose" | "violet" | "emerald" | "cyan";
}

/**
 * 2×2 grid interstitial between horizontal rails.
 * Renders up to 4 cards in a two-column grid, giving visual rhythm
 * between scrollable sections.
 */
export function HomeFeedGrid({ events, onNavigate, accent = "primary" }: Props) {
  const items = events.slice(0, 4);
  if (items.length < 2) return null;

  return (
    <div
      className="grid grid-cols-2 gap-2.5 sm:gap-3"
      aria-label="Selezione in evidenza"
    >
      {items.map((event) => (
        <HomeEventCard
          key={event.id}
          event={event}
          onNavigate={onNavigate}
          accent={accent}
        />
      ))}
    </div>
  );
}
