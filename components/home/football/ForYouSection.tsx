"use client";

import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { ArcCarousel } from "@/components/home/ArcCarousel";
interface Props {
  events: FootballEvent[];
  isPersonalized: boolean;
  isLoggedIn: boolean;
  onNavigate?: () => void;
}

export function ForYouSection({
  events,
  isPersonalized,
  isLoggedIn,
  onNavigate,
}: Props) {
  if (events.length === 0) return null;

  const eyebrow = isPersonalized
    ? "Selezionati per te"
    : isLoggedIn
    ? "Trending per te"
    : "Trending ora";
  const title = isPersonalized ? "Per Te" : "Consigliati";

  return (
    <section
      aria-label={isPersonalized ? "Mercati scelti per te" : "Mercati trending"}
    >
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        accent="violet"
        articleHeadlineTitle
        href="/sezioni/per-te"
        leftSlot={
          !isLoggedIn ? (
            <Link
              href="/auth/login"
              className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:text-primary/80"
            >
              · Accedi →
            </Link>
          ) : null
        }
      />

      <ArcCarousel
        items={events}
        keyExtractor={(e) => e.id}
        renderItem={(event) => (
          <HomeEventCard event={event} onNavigate={onNavigate} accent="violet" />
        )}
      />
    </section>
  );
}
