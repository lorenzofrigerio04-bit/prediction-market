"use client";

import { useState } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { SectionHeader } from "./premium/SectionHeader";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
}

// Per-rank podium elevation — minimal fintech style
const RANK_SHADOWS = [
  // #1 — highest elevation, warm white glow
  "shadow-[0_2px_0_0_rgba(255,255,255,0.10),0_16px_48px_-10px_rgba(255,255,255,0.10),0_32px_64px_-20px_rgba(0,0,0,0.60)]",
  // #2 — mid elevation
  "shadow-[0_2px_0_0_rgba(255,255,255,0.06),0_12px_36px_-10px_rgba(255,255,255,0.06),0_24px_48px_-16px_rgba(0,0,0,0.50)]",
  // #3 — low elevation
  "shadow-[0_1px_0_0_rgba(255,255,255,0.04),0_8px_24px_-8px_rgba(255,255,255,0.04),0_18px_36px_-14px_rgba(0,0,0,0.42)]",
  // #4 — minimal
  "shadow-[0_6px_18px_-8px_rgba(0,0,0,0.36)]",
  // #5 — flat
  "shadow-[0_4px_12px_-6px_rgba(0,0,0,0.28)]",
];


function RankedEventCard({
  event,
  rank,
  onNavigate,
}: {
  event: FootballEvent;
  rank: number;
  onNavigate?: () => void;
}) {
  const shadow = RANK_SHADOWS[rank - 1] ?? RANK_SHADOWS[4];
  const [imgFailed, setImgFailed] = useState(false);
  const coverUrl = event.aiImageUrl?.trim() || null;
  const hasCover = !!coverUrl && !imgFailed;
  return (
    <div className="flex items-end gap-0">
      {/* ── RANK NUMBER — external, anchored to bottom-left of card ── */}
      <div className="flex w-9 shrink-0 justify-center pb-2.5">
        <span
          aria-hidden
          className="select-none font-[Oswald] text-[3.4rem] font-black leading-none"
          style={{
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(255,255,255,0.22)",
          }}
        >
          {rank}
        </span>
      </div>

      {/* ── CARD — full-bleed cover ───────────────────────────────── */}
      <Link
        href={`/events/${event.id}`}
        onClick={onNavigate}
        aria-label={`#${rank} ${event.title}`}
        className={[
          "group relative flex-1 overflow-hidden rounded-2xl",
          "border border-white/[0.08] bg-[#060c1a]",
          "aspect-[16/7]",
          "transition-[transform,box-shadow,border-color] duration-300 ease-out",
          "hover:-translate-y-[1px] hover:border-white/[0.14]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          shadow,
        ].join(" ")}
      >
        {/* Full-bleed image */}
        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}

        {/* Gradient — heavy at bottom for title readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Top glimmer */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />

        {/* Title — bottom, max 2 lines */}
        <div className="absolute inset-x-3 bottom-3">
          <p className="line-clamp-2 font-display text-[0.9rem] font-bold leading-[1.25] tracking-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]">
            {event.title}
          </p>
        </div>
      </Link>
    </div>
  );
}

export function Top24hSection({ events, onNavigate }: Props) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Top 5 eventi delle ultime 24h">
      <SectionHeader eyebrow="Ultime 24 ore" title="Top 5 Oggi" accent="gold" />

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {events.slice(0, 5).map((event, i) => (
          <RankedEventCard
            key={event.id}
            event={event}
            rank={i + 1}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </section>
  );
}
