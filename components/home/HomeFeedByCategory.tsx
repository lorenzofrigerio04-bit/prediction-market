"use client";

import HomeCarouselBox from "./HomeCarouselBox";
import { LoadingBlock, EmptyState } from "@/components/ui";
import { categoryToSlug } from "@/lib/category-slug";
import type { HomeEventTileData } from "./HomeCarouselBox";
import type { HomeEventTileVariant } from "./HomeEventTile";

export interface HomeSection {
  category: string;
  events: HomeEventTileData[];
}

export interface HomeFeedByCategoryProps {
  sections: HomeSection[];
  loading: boolean;
  variant?: HomeEventTileVariant;
  onEventNavigate?: () => void;
  filterEvent?: (title: string) => boolean;
  getDisplayTitle?: (title: string) => string;
}

export function HomeFeedByCategory({
  sections,
  loading,
  variant = "popular",
  onEventNavigate,
  filterEvent = () => true,
  getDisplayTitle = (t) => t,
}: HomeFeedByCategoryProps) {
  if (loading) {
    return <LoadingBlock message="Caricamento eventi…" />;
  }

  const filtered = sections
    .map((s) => ({
      ...s,
      events: s.events.filter((e) => filterEvent(e.title)).map((e) => ({
        ...e,
        title: getDisplayTitle(e.title),
      })),
    }))
    .filter((s) => s.events.length > 0);

  if (filtered.length === 0) {
    return (
      <EmptyState
        title="Nessun evento"
        description="Non ci sono ancora eventi in questa sezione."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {filtered.map((section) => (
        <HomeCarouselBox
          key={section.category}
          title={section.category}
          viewAllHref={`/discover/${categoryToSlug(section.category)}`}
          viewAllLabel="Vedi tutti"
          events={section.events}
          loading={false}
          variant={variant}
          onEventNavigate={onEventNavigate}
        />
      ))}
    </div>
  );
}
