"use client";

import { useMemo } from "react";
import type { FootballEvent } from "@/types/homepage";
import { HomeEventCard } from "@/components/home/HomeEventCard";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";

function rotateEvents(items: FootballEvent[], phaseShift: number): FootballEvent[] {
  if (items.length === 0) return [];
  const n = items.length;
  const s = ((phaseShift % n) + n) % n;
  return [...items.slice(s), ...items.slice(0, s)];
}

interface Props {
  events: FootballEvent[];
  /** Mantenuto per compatibilità coi chiamanti; non più usato (niente auto-scroll). */
  direction?: "left" | "right";
  /** Offset indice per variare l'ordine tra un separatore e l'altro. */
  phaseShift?: number;
}

/**
 * Separatore mercati della pagina news: rail FERMO a scorrimento MANUALE con
 * dissolvenza ai bordi — stesso identico box del separatore notizie in homepage
 * (HomeNewsTickerSeparator), ma con card evento al posto delle news mini.
 * Lo scorrimento automatico vive ora sui rail news (vedi HomeEventRail). Su
 * questa pagina i ruoli sono invertiti: news in movimento, mercati fermi.
 */
export function NewsEventsTickerSeparator({ events, phaseShift = 0 }: Props) {
  const ordered = useMemo(
    () => rotateEvents(events, phaseShift),
    [events, phaseShift]
  );

  if (ordered.length < 2) return null;

  return (
    <div
      className={[
        "relative left-1/2 my-10 w-screen max-w-[100vw] -translate-x-1/2 sm:my-12",
        "border-y border-white/[0.07]",
        "bg-[linear-gradient(180deg,rgba(80,245,252,0.04)_0%,transparent_38%,transparent_62%,rgba(80,245,252,0.03)_100%),radial-gradient(90%_120%_at_50%_0%,rgba(255,255,255,0.045),transparent_55%),#03050c]",
      ].join(" ")}
      role="region"
      aria-label="Mercati in evidenza"
    >
      {/* Sheen statica (niente più sweep animato) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(80,245,252,0.05)_50%,transparent_100%)] opacity-40"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-80"
        aria-hidden
      />

      <div className="relative py-3.5 sm:py-4">
        <div
          className="overflow-x-auto scrollbar-hide px-4 sm:px-6"
          style={newsRailEdgeMaskStyle}
        >
          <div className="flex w-max flex-row items-stretch gap-3 pb-1 sm:gap-4">
            {ordered.map((event) => (
              <div key={event.id} className="w-[178px] shrink-0 sm:w-[194px]">
                <HomeEventCard
                  event={event}
                  accent="primary"
                  probabilityBadgeSize="default"
                  railTitleSize="large"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
