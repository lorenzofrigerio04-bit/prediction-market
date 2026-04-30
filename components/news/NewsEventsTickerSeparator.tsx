"use client";

import { useMemo, useRef, useLayoutEffect, useState } from "react";
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
  direction: "left" | "right";
  phaseShift?: number;
}

/**
 * Stesso comportamento del ticker news in homepage: loop misurato (--home-ticker-dx), pause on hover, maschera bordi.
 * Card eventi in rail (larghezza fissa leggermente maggiore della news mini, titolo enfatizzato, % più discreto).
 */
export function NewsEventsTickerSeparator({ events, direction, phaseShift = 0 }: Props) {
  const ordered = useMemo(
    () => rotateEvents(events, phaseShift),
    [events, phaseShift]
  );

  const trackRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const armedOnceRef = useRef(false);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || ordered.length < 2) return;

    const apply = () => {
      const w = el.scrollWidth;
      if (w < 32) return;
      const half = w / 2;
      el.style.setProperty("--home-ticker-dx", `${-half}px`);
      if (!armedOnceRef.current) {
        armedOnceRef.current = true;
        setArmed(true);
      }
    };

    apply();

    const ro = new ResizeObserver(() => {
      apply();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ordered, phaseShift]);

  if (ordered.length < 2) return null;

  return (
    <div
      className={[
        "group/news-events-ticker relative left-1/2 my-10 w-screen max-w-[100vw] -translate-x-1/2 sm:my-12",
        "border-y border-white/[0.07]",
        "bg-[linear-gradient(180deg,rgba(80,245,252,0.04)_0%,transparent_38%,transparent_62%,rgba(80,245,252,0.03)_100%),radial-gradient(90%_120%_at_50%_0%,rgba(255,255,255,0.045),transparent_55%),#03050c]",
      ].join(" ")}
      role="region"
      aria-label="Mercati in evidenza"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(80,245,252,0.05)_50%,transparent_100%)] bg-[length:200%_100%] opacity-55 motion-safe:animate-home-news-ticker-wash motion-reduce:opacity-30"
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
        <div className="isolate overflow-hidden" style={newsRailEdgeMaskStyle}>
          <div
            ref={trackRef}
            className={[
              "home-news-ticker-track flex w-max flex-row items-stretch gap-3 sm:gap-4",
              direction === "left" ? "home-news-ticker-track--ltr" : "home-news-ticker-track--rtl",
              armed ? "is-armed" : "",
              "motion-safe:will-change-[transform]",
              "motion-safe:backface-hidden motion-safe:[-webkit-backface-visibility:hidden]",
              "motion-safe:group-hover/news-events-ticker:[animation-play-state:paused]",
            ].join(" ")}
          >
            {ordered.map((event) => (
              <div
                key={`a-${event.id}`}
                className="w-[178px] shrink-0 sm:w-[194px]"
              >
                <HomeEventCard
                  event={event}
                  accent="primary"
                  probabilityBadgeSize="default"
                  railTitleSize="large"
                />
              </div>
            ))}
            {ordered.map((event) => (
              <div
                key={`b-${event.id}`}
                className="w-[178px] shrink-0 sm:w-[194px]"
              >
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
