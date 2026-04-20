"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { MatchCard } from "./premium/MatchCard";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

const ACCENTS: Array<"gold" | "rose" | "violet" | "emerald" | "cyan"> = [
  "gold",
  "rose",
  "violet",
  "emerald",
  "cyan",
];

export function UniqueMarketsSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Mercati unici">
      <SectionHeader
        eyebrow="Solo su Prediction Master"
        title="Mercati Unici"
        subtitle="Scommesse creative che non trovi su nessun bookmaker tradizionale"
        accent="gold"
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {events.map((event, idx) => (
          <MatchCard
            key={event.id}
            event={event}
            onNavigate={onNavigate}
            variant="unique"
            uniqueBadge
            accent={ACCENTS[idx % ACCENTS.length]}
          />
        ))}
      </div>
    </section>
  );
}
