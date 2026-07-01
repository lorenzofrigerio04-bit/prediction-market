"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { HomeEventRail } from "@/components/home/HomeEventRail";
interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

export function ViralSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Mercati in evidenza">
      <SectionHeader
        title="In evidenza"
        accent="emerald"
        articleHeadlineTitle
        href="/sezioni/viral"
      />

      <HomeEventRail>
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[280px] min-w-[280px] shrink-0 sm:w-[292px] sm:min-w-[292px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} accent="emerald" />
          </div>
        ))}
      </HomeEventRail>
    </section>
  );
}
