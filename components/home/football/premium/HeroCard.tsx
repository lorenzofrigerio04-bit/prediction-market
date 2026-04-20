"use client";

import { useState } from "react";
import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { parseSportMatchTitle } from "@/lib/sport-match-title";
import { CompetitionBadge } from "./CompetitionBadge";
import { CountdownPill } from "./CountdownPill";
import { OddsBlock } from "./OddsBlock";

interface Props {
  event: FootballEvent;
  onNavigate?: () => void;
}

function stableHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h % 360;
}

function FallbackCover({ seed }: { seed: string }) {
  const h = stableHue(seed);
  const h2 = (h + 50) % 360;
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(140% 110% at 20% 15%, hsl(${h} 75% 24% / 0.95), transparent 55%),
          radial-gradient(120% 110% at 85% 85%, hsl(${h2} 75% 22% / 0.9), transparent 55%),
          linear-gradient(180deg, #0b1c3d, #04091f)
        `,
      }}
    />
  );
}

function formatMatchDay(event: FootballEvent): string {
  const src = event.realWorldEventTime
    ? new Date(event.realWorldEventTime)
    : (() => {
        const d = new Date(event.closesAt);
        d.setMinutes(d.getMinutes() - 90);
        return d;
      })();
  const day = src.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = src.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day.charAt(0).toUpperCase() + day.slice(1)} · ${time}`;
}

export function HeroCard({ event, onNavigate }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const teams = parseSportMatchTitle(event.title);
  const coverUrl = event.aiImageUrl?.trim() || null;
  const hasCover = !!coverUrl && !imgFailed;

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onNavigate}
      aria-label={`Apri evento in primo piano: ${event.title}`}
      className={[
        "group relative block overflow-hidden rounded-[1.25rem]",
        "border border-white/[0.08] bg-white/[0.02]",
        "transition-[transform,box-shadow,border-color] duration-300",
        "hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-[0_28px_72px_-24px_rgba(80,245,252,0.28)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      ].join(" ")}
    >
      {/* ── COVER (responsive height) ───────────────────────────────── */}
      <div className="relative h-[200px] w-full overflow-hidden sm:h-[260px] md:h-[300px]">
        <FallbackCover seed={event.id + event.title} />
        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl!}
            alt=""
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}

        {/* Vignette + glows */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/25"
        />
        <div
          aria-hidden
          className="absolute -inset-40 bg-[radial-gradient(60%_40%_at_20%_20%,rgba(80,245,252,0.14),transparent_60%)]"
        />
        <div
          aria-hidden
          className="absolute right-0 top-0 h-[60%] w-[40%] bg-[radial-gradient(50%_50%_at_80%_10%,rgba(252,211,77,0.08),transparent_60%)]"
        />

        {/* Top bar */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2 sm:inset-x-5 sm:top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-amber-400/[0.10] px-2 py-[3px] backdrop-blur-md">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.75)]"
            />
            <span className="font-[Oswald] text-[9.5px] font-semibold uppercase tracking-[0.26em] text-amber-200">
              In primo piano
            </span>
          </span>
          <CountdownPill closesAt={event.closesAt} size="sm" variant="glass" />
        </div>

        {/* Bottom content overlay */}
        <div className="absolute inset-x-3.5 bottom-3.5 sm:inset-x-5 sm:bottom-4">
          {/* League + date */}
          <div className="flex items-center gap-2">
            <CompetitionBadge
              league={event.sportLeague}
              category={event.category}
              size="sm"
            />
            <span className="font-[Oswald] text-[9.5px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[10.5px]">
              {formatMatchDay(event)}
            </span>
          </div>

          {/* Team names or title */}
          {teams ? (
            <div className="mt-2 flex items-center gap-2 sm:mt-2.5 sm:gap-4">
              <span className="min-w-0 flex-1 truncate text-right font-display text-[1.3rem] font-extrabold leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-[1.85rem]">
                {teams.teamA}
              </span>
              <span
                aria-hidden
                className="relative inline-flex items-center justify-center"
              >
                <span className="absolute inset-0 -m-2 rounded-full bg-primary/15 blur-lg" />
                <span className="relative font-[Oswald] text-[10px] font-bold uppercase tracking-[0.3em] text-primary sm:text-[12px]">
                  vs
                </span>
              </span>
              <span className="min-w-0 flex-1 truncate font-display text-[1.3rem] font-extrabold leading-none tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:text-[1.85rem]">
                {teams.teamB}
              </span>
            </div>
          ) : (
            <h3 className="mt-2 line-clamp-2 font-display text-[1.1rem] font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] sm:mt-2.5 sm:text-[1.55rem]">
              {event.title}
            </h3>
          )}
        </div>
      </div>

      {/* ── BODY (below cover on all screens) ────────────────────────── */}
      <div className="flex flex-col gap-2.5 border-t border-white/[0.06] bg-white/[0.015] p-3.5 sm:p-5">
        <OddsBlock event={event} compact />

        <div className="flex items-center justify-between gap-3 text-[11px] text-white/50">
          <span className="inline-flex items-center gap-1.5">
            <span className="font-numeric font-semibold tabular-nums text-white/80">
              {event.predictionsCount.toLocaleString("it-IT")}
            </span>
            <span className="font-[Oswald] uppercase tracking-[0.18em]">predictions</span>
          </span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-white/20" />
          <span className="inline-flex items-center gap-1.5">
            <span className="font-numeric font-semibold tabular-nums text-white/80">
              {event.totalCredits.toLocaleString("it-IT")}
            </span>
            <span className="font-[Oswald] uppercase tracking-[0.18em]">crediti</span>
          </span>
          <span className="ml-auto font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
            Vai →
          </span>
        </div>
      </div>
    </Link>
  );
}
