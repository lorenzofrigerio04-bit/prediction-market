"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { MatchCard } from "./premium/MatchCard";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

export function TopEventsSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Top eventi della settimana">
      <SectionHeader
        eyebrow="Il meglio della settimana"
        title="Top Eventi"
        subtitle="I big match che tutti aspettano — prossimi 7 giorni"
        accent="gold"
        href="/sport"
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {events.map((event) => (
          <MatchCard
            key={event.id}
            event={event}
            onNavigate={onNavigate}
            accent="gold"
          />
        ))}
      </div>
    </section>
  );
}
