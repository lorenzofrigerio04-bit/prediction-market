"use client";

import Link from "next/link";
import type { FootballEvent } from "@/types/homepage";
import { parseSportMatchTitle } from "@/lib/sport-match-title";
import { CompetitionBadge } from "./CompetitionBadge";

interface Props {
  event: FootballEvent;
  onNavigate?: () => void;
}

function formatMatchTime(event: FootballEvent): string {
  const src = event.realWorldEventTime
    ? new Date(event.realWorldEventTime)
    : (() => {
        const d = new Date(event.closesAt);
        d.setMinutes(d.getMinutes() - 90);
        return d;
      })();
  return src.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CalendarItem({ event, onNavigate }: Props) {
  const teams = parseSportMatchTitle(event.title);
  const label = teams ? `${teams.teamA} — ${teams.teamB}` : event.title;

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onNavigate}
      className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:gap-3.5 sm:px-3 sm:py-2.5"
    >
      {/* Time chip */}
      <div className="flex w-12 shrink-0 flex-col items-center rounded-md border border-white/10 bg-white/[0.04] py-1 sm:w-14 sm:rounded-lg sm:py-1.5">
        <span className="font-numeric text-[12px] font-bold tabular-nums leading-none text-white sm:text-[13px]">
          {formatMatchTime(event)}
        </span>
        <span className="mt-0.5 hidden font-[Oswald] text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:block">
          Kickoff
        </span>
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[13px] font-semibold text-white/95 transition-colors group-hover:text-white sm:text-[14px]">
          {label}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 sm:mt-1">
          <CompetitionBadge
            league={event.sportLeague}
            category={event.category}
            size="sm"
            variant="ghost"
          />
          {event.predictionsCount > 0 && (
            <span className="hidden font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35 sm:inline sm:text-[9.5px]">
              {event.predictionsCount.toLocaleString("it-IT")} pred.
            </span>
          )}
        </div>
      </div>

      {/* Yes% + chevron */}
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-numeric text-[12px] font-bold tabular-nums leading-none text-emerald-300">
          {event.yesPct}%
        </span>
        <span
          aria-hidden
          className="text-[13px] text-white/30 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-white/60"
        >
          →
        </span>
      </div>
    </Link>
  );
}
