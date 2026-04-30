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
            className="w-[260px] min-w-[260px] shrink-0 sm:w-[268px] sm:min-w-[268px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} accent="emerald" />
          </div>
        ))}
      </HomeEventRail>
    </section>
  );
}
