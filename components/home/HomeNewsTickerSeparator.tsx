"use client";

import { useMemo } from "react";
import { NewsCard } from "@/components/news/NewsCard";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";
import type { HomepageNewsTickerItem } from "@/lib/hooks/useHomepageNewsTickers";

function rotateItems(
  items: HomepageNewsTickerItem[],
  phaseShift: number
): HomepageNewsTickerItem[] {
  if (items.length === 0) return [];
  const n = items.length;
  const s = ((phaseShift % n) + n) % n;
  return [...items.slice(s), ...items.slice(0, s)];
}

interface Props {
  items: HomepageNewsTickerItem[];
  /** Mantenuto per compatibilità coi chiamanti; non più usato (niente auto-scroll). */
  direction?: "left" | "right";
  /** Offset indice per variare l'ordine tra un separatore e l'altro. */
  phaseShift?: number;
}

/**
 * Separatore notizie homepage: rail a SCORRIMENTO MANUALE con dissolvenza ai
 * bordi (stesso pattern dei rail mercati). Niente più auto-scroll: l'utente
 * scorre liberamente le card notizia.
 */
export function HomeNewsTickerSeparator({ items, phaseShift = 0 }: Props) {
  const ordered = useMemo(
    () => rotateItems(items, phaseShift),
    [items, phaseShift]
  );

  if (ordered.length < 2) return null;

  return (
    <div
      className={[
        "relative left-1/2 mb-10 mt-2 w-screen max-w-[100vw] -translate-x-1/2 sm:mb-12 sm:mt-3",
        "border-y border-white/[0.07]",
        "bg-[linear-gradient(180deg,rgba(80,245,252,0.04)_0%,transparent_38%,transparent_62%,rgba(80,245,252,0.03)_100%),radial-gradient(90%_120%_at_50%_0%,rgba(255,255,255,0.045),transparent_55%),#03050c]",
      ].join(" ")}
      role="region"
      aria-label="Notizie"
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
            {ordered.map((article) => (
              <div key={article.id} className="flex shrink-0">
                <NewsCard article={article} layout="mini" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
