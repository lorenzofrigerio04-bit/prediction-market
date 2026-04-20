"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CalendarDay } from "@/types/homepage";
import {
  COMPETITION_FILTERS,
  getCompetitionFilter,
  type CompetitionFilterValue,
} from "@/lib/filterSport20Pipeline";
import { SectionHeader } from "./premium/SectionHeader";
import { CalendarItem } from "./premium/CalendarItem";

interface Props {
  calendar: CalendarDay[];
  onNavigate?: () => void;
}

export function UpcomingCalendar({ calendar, onNavigate }: Props) {
  const [activeFilter, setActiveFilter] =
    useState<CompetitionFilterValue>("all");

  const filteredCalendar = useMemo<CalendarDay[]>(() => {
    if (activeFilter === "all") return calendar;
    return calendar
      .map((day) => ({
        ...day,
        events: day.events.filter(
          (e) => getCompetitionFilter(e.sportLeague) === activeFilter
        ),
      }))
      .filter((day) => day.events.length > 0);
  }, [calendar, activeFilter]);

  if (calendar.length === 0) return null;

  const totalMatches = filteredCalendar.reduce(
    (n, d) => n + d.events.length,
    0
  );

  return (
    <section aria-label="Prossimi 7 giorni">
      <SectionHeader
        eyebrow="Prossimi 7 giorni"
        title="Calendario"
        subtitle={
          totalMatches > 0
            ? `${totalMatches} ${
                totalMatches === 1 ? "partita" : "partite"
              } in programma`
            : undefined
        }
        accent="emerald"
      />

      {/* Filter tabs */}
      <div
        role="tablist"
        className="scrollbar-hide -mx-1 mb-4 flex items-center gap-1.5 overflow-x-auto px-1 pb-1"
      >
        {COMPETITION_FILTERS.map((filter) => {
          const active = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveFilter(filter.value)}
              className={[
                "shrink-0 rounded-full border px-3.5 py-1.5 font-[Oswald] text-[10.5px] font-semibold uppercase tracking-[0.2em] transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active
                  ? "border-primary/40 bg-primary/[0.12] text-primary shadow-[0_0_18px_-4px_rgba(80,245,252,0.45)]"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/90",
              ].join(" ")}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filteredCalendar.length === 0 ? (
        <p className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-8 text-center text-sm text-white/45">
          Nessun evento in programma per questa competizione
        </p>
      ) : (
        <div className="space-y-3.5">
          {filteredCalendar.map((day) => (
            <div
              key={day.dateKey}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.015] px-4 py-2.5">
                <h3 className="font-[Oswald] text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                  {day.dateLabel}
                </h3>
                <span className="font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                  {day.events.length}{" "}
                  {day.events.length === 1 ? "evento" : "eventi"}
                </span>
              </div>
              <div className="divide-y divide-white/[0.04] px-1 py-1">
                {day.events.map((event) => (
                  <CalendarItem
                    key={event.id}
                    event={event}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
          {calendar.length >= 15 && (
            <Link
              href="/sport"
              className="group block w-full rounded-2xl border border-white/10 bg-white/[0.02] py-3.5 text-center font-[Oswald] text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
            >
              Vedi calendario completo{" "}
              <span
                aria-hidden
                className="inline-block transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
