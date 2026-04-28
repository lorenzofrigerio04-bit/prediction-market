"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { ArcCarousel } from "@/components/home/ArcCarousel";
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

      <ArcCarousel
        items={events}
        keyExtractor={(e) => e.id}
        renderItem={(event) => (
          <HomeEventCard event={event} onNavigate={onNavigate} accent="emerald" showExpiry />
        )}
      />
    </section>
  );
}
