"use client";

import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { ArcCarousel } from "@/components/home/ArcCarousel";
interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

export function ViralSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Eventi virali">
      <SectionHeader
        eyebrow="Viral"
        title="Sta esplodendo ora"
        accent="crimson"
        articleHeadlineTitle
        href="/sezioni/viral"
      />

      <ArcCarousel
        items={events}
        keyExtractor={(e) => e.id}
        renderItem={(event) => (
          <HomeEventCard event={event} onNavigate={onNavigate} accent="rose" />
        )}
      />
    </section>
  );
}
