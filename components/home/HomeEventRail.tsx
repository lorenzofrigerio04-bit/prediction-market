"use client";

import {
  Children,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";

interface HomeEventRailProps {
  children: ReactNode;
  className?: string;
  /**
   * Rail a tutto schermo (edge-to-edge): esce dal contenitore centrato con un
   * breakout `w-screen` e padding `px-4 sm:px-6` (come la striscia news/mercati).
   * Default `false` → rail dentro la colonna (homepage), solo piccolo bleed.
   */
  fullBleed?: boolean;
}

/** Velocità dello scorrimento automatico (px/s) — lento e leggibile. */
const RAIL_MARQUEE_SPEED = 26;

/**
 * Rail mercati homepage: scorrimento AUTOMATICO lento e ultra-fluido (marquee con
 * traccia duplicata → loop senza giunzione, transform su GPU). Si mette in pausa
 * al passaggio del mouse e, con prefers-reduced-motion, diventa un rail a
 * scorrimento manuale. Dissolvenza ai bordi come i rail news.
 */
export function HomeEventRail({
  children,
  className = "",
  fullBleed = false,
}: HomeEventRailProps) {
  const items = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const apply = () => {
      // La traccia contiene due sequenze identiche: metà larghezza = una sequenza.
      const half = el.scrollWidth / 2;
      if (half < 32) return;
      el.style.setProperty("--rail-marquee-dx", `${-half}px`);
      el.style.setProperty("--rail-marquee-dur", `${half / RAIL_MARQUEE_SPEED}s`);
      setArmed(true);
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length]);

  return (
    <div
      className={`group/rail ${
        fullBleed
          ? "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2"
          : "-mx-2 sm:-mx-4"
      } ${className}`}
    >
      <div
        className={`overflow-hidden pb-1 scrollbar-hide motion-reduce:overflow-x-auto ${
          fullBleed ? "px-4 sm:px-6" : "px-2 sm:px-4"
        }`}
        style={newsRailEdgeMaskStyle}
      >
        <div
          ref={trackRef}
          className={[
            "home-rail-marquee-track flex w-max gap-2.5 pb-2 sm:gap-3",
            armed ? "is-armed" : "",
            "motion-safe:will-change-transform motion-safe:backface-hidden",
            "motion-safe:group-hover/rail:[animation-play-state:paused]",
          ].join(" ")}
        >
          {items.map((child, i) => (
            <div key={`a-${i}`} className="flex shrink-0">
              {child}
            </div>
          ))}
          {items.map((child, i) => (
            <div key={`b-${i}`} aria-hidden className="flex shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
