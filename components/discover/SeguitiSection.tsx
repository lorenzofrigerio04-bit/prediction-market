"use client";

import { useState, useRef, useEffect } from "react";
import HomeEventTile, { type HomeEventTileVariant } from "@/components/home/HomeEventTile";
import type { HomeEventTileData } from "@/components/home/HomeCarouselBox";

const STAGGER_MS = 80;

export interface SeguitiSectionEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  [key: string]: unknown;
}

interface SeguitiSectionProps {
  title: string;
  topN: number;
  topEvents: SeguitiSectionEvent[];
  allEvents: SeguitiSectionEvent[];
  categories: string[];
  toTileData: (e: SeguitiSectionEvent) => HomeEventTileData;
  filterVediTutti?: (e: SeguitiSectionEvent) => boolean;
  variant: HomeEventTileVariant;
  emptyMessage?: string;
}

export default function SeguitiSection({
  title,
  topN,
  topEvents,
  allEvents,
  categories,
  toTileData,
  filterVediTutti,
  variant,
  emptyMessage = "Nessun evento al momento.",
}: SeguitiSectionProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"all" | string | null>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  const eventsInPanel =
    panelMode === "all"
      ? (filterVediTutti ? allEvents.filter(filterVediTutti) : allEvents)
      : panelMode
        ? allEvents.filter((e) => e.category === panelMode)
        : [];

  const openVediTutti = () => {
    setPanelMode("all");
    setPanelOpen(true);
  };
  const openCategory = (cat: string) => {
    setPanelMode(cat);
    setPanelOpen(true);
  };
  const closePanel = () => {
    setPanelOpen(false);
    setPanelMode(null);
  };

  useEffect(() => {
    if (topEvents.length === 0) return;
    setVisibleIndices(new Set());
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    topEvents.forEach((_, i) => {
      timeouts.push(
        setTimeout(() => {
          setVisibleIndices((prev) => new Set([...prev, i]));
        }, i * STAGGER_MS)
      );
    });
    return () => timeouts.forEach(clearTimeout);
  }, [topEvents.length]);

  return (
    <section className="py-4 sm:py-5" aria-label={title}>
      <h2 className="text-ds-h2 font-bold text-fg mb-3 sm:mb-4">{title}</h2>

      {topEvents.length === 0 ? (
        <p className="py-2 text-ds-body-sm text-fg-muted">{emptyMessage}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
            {topEvents.map((event, index) => {
              const tile = toTileData(event);
              const isVisible = visibleIndices.has(index);
              return (
                <div
                  key={event.id}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
                    transition: `opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                >
                  <HomeEventTile
                    id={tile.id}
                    title={tile.title}
                    category={tile.category}
                    closesAt={tile.closesAt}
                    yesPct={tile.yesPct}
                    predictionsCount={tile.predictionsCount}
                    variant={variant}
                  />
                </div>
              );
            })}
          </div>

          {(filterVediTutti ? allEvents.filter(filterVediTutti).length : allEvents.length) > topN && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={openVediTutti}
                className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover focus-visible:underline py-2 px-3 rounded-lg transition-colors"
              >
                Vedi tutti
              </button>
            </div>
          )}

          {panelOpen && (
            <div
              ref={panelRef}
              className="mt-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
              role="dialog"
              aria-label="Elenco esteso"
            >
              <div className="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-ds-body-sm font-semibold text-fg">
                    {panelMode === "all" ? "Tutti" : panelMode}
                  </span>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="text-ds-body-sm font-semibold text-primary hover:text-primary-hover py-2 px-3 rounded-lg transition-colors"
                  >
                    Chiudi
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                  {eventsInPanel.map((event) => {
                    const tile = toTileData(event);
                    return (
                      <HomeEventTile
                        key={event.id}
                        id={tile.id}
                        title={tile.title}
                        category={tile.category}
                        closesAt={tile.closesAt}
                        yesPct={tile.yesPct}
                        predictionsCount={tile.predictionsCount}
                        variant={variant}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => openCategory(category)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-ds-body-sm font-medium text-fg hover:bg-white/10 hover:border-primary/30 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
