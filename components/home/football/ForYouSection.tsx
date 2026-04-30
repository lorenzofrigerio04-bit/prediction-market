"use client";

import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { HomeEventRail } from "@/components/home/HomeEventRail";
interface Props {
  events: FootballEvent[];
  isLoggedIn: boolean;
  onNavigate?: () => void;
}

export function ForYouSection({
  events,
  isLoggedIn,
  onNavigate,
}: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Mercati consigliati">
      <SectionHeader
        title="Consigliati"
        accent="violet"
        articleHeadlineTitle
        href="/sezioni/per-te"
        leftSlot={
          !isLoggedIn ? (
            <Link
              href="/auth/login"
              className="font-kalshi text-[10px] font-semibold uppercase tracking-[0.24em] text-primary transition-colors hover:text-primary/80"
            >
              · Accedi →
            </Link>
          ) : null
        }
      />

      <HomeEventRail>
        {events.map((event) => (
          <div
            key={event.id}
            className="w-[260px] min-w-[260px] shrink-0 sm:w-[268px] sm:min-w-[268px]"
          >
            <HomeEventCard event={event} onNavigate={onNavigate} accent="violet" />
          </div>
        ))}
      </HomeEventRail>
    </section>
  );
}
