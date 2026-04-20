"use client";

import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";

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

      <div className="netflix-rail-scroll scrollbar-hide -mx-1 flex snap-x snap-proximity gap-2.5 overflow-x-auto px-1 pb-2 sm:gap-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[190px] min-w-[190px] snap-start sm:w-[240px] sm:min-w-[240px] lg:w-[272px] lg:min-w-[272px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} accent="violet" />
          </div>
        ))}
      </div>
    </section>
  );
}
