"use client";

import Link from "next/link";
import HomeEventTile from "./HomeEventTile";
import { LoadingBlock } from "@/components/ui";

export interface HomeEventTileData {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability?: number;
}

interface HomeCarouselBoxProps {
  title: string;
  viewAllHref: string;
  viewAllLabel?: string;
  events: HomeEventTileData[];
  loading: boolean;
  /** Colori bordo per distinguere la sezione (es. border-primary/20) */
  borderClass?: string;
}

export default function HomeCarouselBox({
  title,
  viewAllHref,
  viewAllLabel = "Vedi tutti",
  events,
  loading,
  borderClass = "border-white/15",
}: HomeCarouselBoxProps) {
  return (
    <section
      className={`rounded-2xl border bg-transparent p-4 sm:p-5 mb-5 md:mb-6 ${borderClass}`}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="text-ds-h2 font-bold text-fg">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline shrink-0"
        >
          {viewAllLabel} →
        </Link>
      </div>
      {loading ? (
        <LoadingBlock message="Caricamento…" />
      ) : events.length === 0 ? (
        <p className="text-ds-body-sm text-fg-muted py-4">Nessun evento al momento.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {events.map((event) => (
            <HomeEventTile
              key={event.id}
              id={event.id}
              title={event.title}
              category={event.category}
              closesAt={event.closesAt}
              probability={event.probability}
            />
          ))}
        </div>
      )}
    </section>
  );
}
