"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

export function Top24hSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Top 5 eventi delle ultime 24h">
      <SectionHeader
        eyebrow="Ultime 24 ore"
        title="Top 5 Oggi"
        subtitle="Gli eventi più seguiti in questo momento"
        accent="gold"
      />

      <div className="netflix-rail-scroll scrollbar-hide -mx-1 flex snap-x snap-proximity gap-2.5 overflow-x-auto px-1 pb-2 sm:gap-3">
        {events.slice(0, 5).map((event) => (
          <div
            key={event.id}
            className="w-[190px] min-w-[190px] snap-start sm:w-[240px] sm:min-w-[240px] lg:w-[272px] lg:min-w-[272px]"
          >
            <HomeEventCard
              event={event}
              onNavigate={onNavigate}
              accent="gold"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
