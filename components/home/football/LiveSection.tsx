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
        eyebrow="In diretta ora"
        title="Live"
        accent="crimson"
        articleHeadlineTitle
        href="/sezioni/live"
      />

      <HomeEventRail>
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[260px] min-w-[260px] shrink-0 sm:w-[268px] sm:min-w-[268px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} isLive accent="rose" />
          </div>
        ))}
      </HomeEventRail>
    </section>
  );
}
