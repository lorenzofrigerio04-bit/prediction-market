"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

export function ExpiringSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Eventi in scadenza">
      <SectionHeader
        eyebrow="Ultima chance"
        title="In Scadenza"
        subtitle="Mercati che chiudono nelle prossime 48 ore"
        accent="emerald"
      />

      <div className="netflix-rail-scroll scrollbar-hide -mx-1 flex snap-x snap-proximity gap-2.5 overflow-x-auto px-1 pb-2 sm:gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[190px] min-w-[190px] snap-start sm:w-[240px] sm:min-w-[240px] lg:w-[272px] lg:min-w-[272px]"
          >
            <HomeEventCard
              event={event}
              onNavigate={onNavigate}
              accent="emerald"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
