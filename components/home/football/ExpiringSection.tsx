"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { HomeEventRail } from "@/components/home/HomeEventRail";
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
        accent="emerald"
        articleHeadlineTitle
        href="/sezioni/in-scadenza"
      />

      <HomeEventRail>
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[260px] min-w-[260px] shrink-0 sm:w-[268px] sm:min-w-[268px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} accent="emerald" showExpiry />
          </div>
        ))}
      </HomeEventRail>
    </section>
  );
}
