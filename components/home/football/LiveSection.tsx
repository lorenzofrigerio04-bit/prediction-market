"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { HomeEventRail } from "@/components/home/HomeEventRail";
interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

export function LiveSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Partite live ora">
      <SectionHeader
        title="Live"
        accent="crimson"
        articleHeadlineTitle
        href="/sezioni/live"
      />

      <HomeEventRail>
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[280px] min-w-[280px] shrink-0 sm:w-[292px] sm:min-w-[292px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} isLive accent="rose" />
          </div>
        ))}
      </HomeEventRail>
    </section>
  );
}
