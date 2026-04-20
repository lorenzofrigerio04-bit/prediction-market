"use client";

import type { FootballEvent } from "@/types/homepage";
import { HomeEventCard } from "./HomeEventCard";

interface Props {
  events: FootballEvent[];
  onNavigate?: () => void;
  cardAccent?: "primary" | "gold" | "rose" | "violet" | "emerald" | "cyan";
}

function padToMin<T>(arr: T[], min: number): T[] {
  if (arr.length >= min) return arr;
  const result = [...arr];
  while (result.length < min) result.push(...arr);
  return result.slice(0, Math.max(arr.length, min));
}

/**
 * Purely visual separator between homepage sections.
 * Two rows of event cards scrolling in opposite directions — no header, no title.
 */
export function HomeTrendingRail({
  events,
  onNavigate,
  cardAccent = "primary",
}: Props) {
  if (events.length < 2) return null;

  const pool = padToMin(events, 8);

  const row1Items = padToMin(pool.filter((_, i) => i % 2 === 0), 4);
  const row2Items = padToMin(pool.filter((_, i) => i % 2 === 1), 4);

  const row1Loop = [...row1Items, ...row1Items];
  const row2Loop = [...row2Items, ...row2Items];

  const cardW = 148;
  const gap = 8;
  const dur1 = ((row1Items.length * (cardW + gap)) / 38).toFixed(1);
  const dur2 = ((row2Items.length * (cardW + gap)) / 34).toFixed(1);

  const separatorLine =
    "linear-gradient(90deg, transparent 0%, rgba(10,186,181,0.18) 15%, rgba(10,186,181,0.38) 50%, rgba(10,186,181,0.18) 85%, transparent 100%)";

  return (
    <div
      className="trending-rail-wrap pointer-events-none relative -mx-2 overflow-hidden sm:-mx-4"
      style={{
        WebkitMaskImage:
          "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
        maskImage:
          "linear-gradient(90deg, transparent 0%, #000 7%, #000 93%, transparent 100%)",
      }}
    >
      {/* Top tiffany line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: separatorLine }}
      />
      {/* Top glow bleed */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-6"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,186,181,0.06) 0%, transparent 100%)",
        }}
      />

      <div className="flex flex-col gap-[8px] py-4">
        {/* Row 1 — left */}
        <div
          className="trending-rail-track flex gap-[8px]"
          style={{
            animation: `trending-rail-left ${dur1}s linear infinite`,
            willChange: "transform",
          }}
        >
          {row1Loop.map((event, i) => (
            <div
              key={`r1-${event.id}-${i}`}
              className="pointer-events-auto shrink-0"
              style={{ width: cardW }}
            >
              <HomeEventCard event={event} onNavigate={onNavigate} accent={cardAccent} />
            </div>
          ))}
        </div>

        {/* Row 2 — right */}
        <div
          className="trending-rail-track flex gap-[8px]"
          style={{
            animation: `trending-rail-right ${dur2}s linear infinite`,
            willChange: "transform",
          }}
        >
          {row2Loop.map((event, i) => (
            <div
              key={`r2-${event.id}-${i}`}
              className="pointer-events-auto shrink-0"
              style={{ width: cardW }}
            >
              <HomeEventCard event={event} onNavigate={onNavigate} accent={cardAccent} />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom glow bleed */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-6"
        style={{
          background:
            "linear-gradient(0deg, rgba(10,186,181,0.06) 0%, transparent 100%)",
        }}
      />
      {/* Bottom tiffany line */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: separatorLine }}
      />
    </div>
  );
}
