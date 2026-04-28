"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { ArcCarousel } from "@/components/home/ArcCarousel";
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

      <ArcCarousel
        items={events}
        keyExtractor={(e) => e.id}
        renderItem={(event) => (
          <HomeEventCard event={event} onNavigate={onNavigate} isLive accent="rose" />
        )}
      />
    </section>
  );
}
