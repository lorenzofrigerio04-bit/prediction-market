"use client";

import { useState, useEffect } from "react";
import { getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";
import { useLandingBackground, CATEGORY_BACKGROUNDS } from "@/components/landing/LandingBackgroundCarousel";

/** Box evento: stessa struttura visiva del tile (sfondo in sync con la pagina o categoria, overlay). Sfondo in crossfade superfluido quando senza categoria. */
export default function CreaEventBoxShell({
  category,
  children,
}: {
  category: string;
  children: React.ReactNode;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const { activeIndex } = useLandingBackground();
  const syncWithPage = !category;
  const categoryImagePath = category ? getCategoryImagePath(category) : null;
  const fallbackGradient = category ? getCategoryFallbackGradient(category) : "linear-gradient(135deg, #374151 0%, #1f2937 100%)";

  useEffect(() => {
    if (!category) setImageFailed(false);
  }, [category]);

  return (
    <div className="crea-event-tile-configurator group relative block min-h-[175px] overflow-hidden rounded-lg border-0 bg-transparent transition-all duration-300 sm:min-h-[195px]">
      {/* Sfondo: in sync con la pagina (stessi slide, crossfade fluido) oppure immagine categoria */}
      {syncWithPage ? (
        CATEGORY_BACKGROUNDS.map((src, i) => (
          <div
            key={src}
            className="crea-event-tile-configurator__slide"
            data-active={i === activeIndex}
            style={{ backgroundImage: `url(${src})` }}
            aria-hidden
          />
        ))
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ background: fallbackGradient }}
            aria-hidden
          />
          {categoryImagePath && !imageFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={categoryImagePath}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setImageFailed(true)}
              aria-hidden
            />
          )}
        </>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 pointer-events-none" aria-hidden />
      <div className="relative z-10 flex h-full min-h-[175px] flex-col justify-between p-3 sm:min-h-[195px] sm:p-4">
        {children}
      </div>
    </div>
  );
}
