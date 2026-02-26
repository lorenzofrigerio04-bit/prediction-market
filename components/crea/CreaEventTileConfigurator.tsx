"use client";

import { useState, useRef, useEffect } from "react";
import { getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";
import { useLandingBackground, CATEGORY_BACKGROUNDS, CATEGORY_TO_BACKGROUND_INDEX } from "@/components/landing/LandingBackgroundCarousel";

export interface CreaEventTileConfiguratorProps {
  category: string;
  onCategoryChange?: (value: string) => void;
  categories: string[];
  title: string;
  onTitleChange?: (value: string) => void;
  /** Chiamata quando l'utente "conferma" il titolo (blur del campo o tasto Invio) con titolo non vuoto */
  onTitleConfirm?: () => void;
  description: string;
  onDescriptionChange?: (value: string) => void;
  /** Solo lettura: stessa grafica ma senza controlli editabili (per anteprima Fase 2) */
  readOnly?: boolean;
  /** Se valorizzato in readOnly, sotto al grafico mostra la scadenza con spunta verde (STEP 5 Consolida) */
  closesAt?: string;
}

export default function CreaEventTileConfigurator({
  category,
  onCategoryChange,
  categories,
  title,
  onTitleChange,
  onTitleConfirm,
  description,
  onDescriptionChange,
  readOnly = false,
  closesAt,
}: CreaEventTileConfiguratorProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const { activeIndex, setFrozenIndex } = useLandingBackground();

  /** Se non c'è categoria selezionata: sfondo in sync con la pagina (stessi slide, stessa transizione). Una volta selezionata la categoria, il box resta sulla foto della categoria. In readOnly la categoria c'è sempre. */
  const syncWithPage = !readOnly && !category;
  const categoryImagePath = category ? getCategoryImagePath(category) : null;
  const fallbackGradient = category ? getCategoryFallbackGradient(category) : "linear-gradient(135deg, #374151 0%, #1f2937 100%)";

  /** Quando la categoria viene deselezionata, riprendi la rotazione dello sfondo pagina. */
  useEffect(() => {
    if (!category) setFrozenIndex(null);
  }, [category, setFrozenIndex]);

  useEffect(() => {
    if (!categoryOpen || readOnly) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryOpen, readOnly]);

  const categoryOptions = categories.length > 0 ? categories : ["Sport", "Politica", "Economia", "Tecnologia", "Cultura", "Scienza", "Intrattenimento"];

  return (
    <div className="crea-event-tile-configurator group relative block min-h-[175px] overflow-hidden rounded-lg border-0 bg-transparent transition-all duration-300 sm:min-h-[195px]">
      {/* Sfondo: in sync con la pagina = stessi slide in crossfade (stessa transizione fluida). Altrimenti una sola foto categoria. */}
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
        {/* CATEGORIA → menu a tendina oppure badge fisso (readOnly) */}
        <div ref={categoryRef} className="relative flex flex-col items-start gap-1">
          {readOnly ? (
            <span
              className="inline-flex w-fit rounded-md border border-white/30 bg-black/70 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro"
              aria-label={`Categoria: ${category}`}
            >
              {category || "CATEGORIA"}
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCategoryOpen((o) => !o)}
                className="inline-flex w-fit rounded-md border border-white/30 bg-black/70 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                aria-expanded={categoryOpen}
                aria-haspopup="listbox"
              >
                {category || "CATEGORIA"}
              </button>
              {categoryOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1 min-w-[160px] py-1.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/85 dark:bg-black/60 backdrop-blur-md shadow-lg max-h-[min(280px,70vh)] overflow-y-auto"
                  role="listbox"
                  aria-label="Opzioni categoria"
                >
                  {categoryOptions.map((opt) => {
                    const isSelected = category === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          const index = CATEGORY_TO_BACKGROUND_INDEX[opt] ?? 0;
                          setFrozenIndex(index);
                          onCategoryChange?.(opt);
                          setCategoryOpen(false);
                        }}
                        className={`w-full px-3 sm:px-4 py-2.5 text-left text-sm sm:text-ds-body-sm font-medium transition-colors ${
                          isSelected ? "bg-primary/15 text-primary" : "text-fg hover:bg-white/10 dark:hover:bg-white/10"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <div>
          {readOnly ? (
            <>
              <p
                className="mb-2 w-full text-sm font-semibold leading-snug text-white sm:text-ds-body-sm"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" }}
              >
                {title || "—"}
              </p>
              <p
                className="mb-2 w-full text-xs font-medium text-white/90 sm:text-ds-micro line-clamp-2"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,0.8)" }}
              >
                {description || "—"}
              </p>
              <div
                className="flex h-1.5 w-full overflow-hidden rounded-full bg-black/60 shadow-inner backdrop-blur-[1px]"
                role="presentation"
              >
                <div
                  className="h-full w-1/2 shrink-0 rounded-l-full"
                  style={{ background: "linear-gradient(90deg, rgb(20 148 132) 0%, rgb(13 148 136) 100%)" }}
                />
                <div
                  className="h-full w-1/2 shrink-0 rounded-r-full"
                  style={{ background: "linear-gradient(90deg, rgb(239 68 68) 0%, rgb(244 63 94) 100%)" }}
                />
              </div>
              {readOnly && closesAt && (
                <div
                  className="mt-2 flex items-center gap-2 text-xs font-medium text-white/90"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 text-white" aria-hidden>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>
                    Scadenza: {new Date(closesAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <label className="sr-only" htmlFor="crea-tile-title">Titolo evento</label>
              <input
                id="crea-tile-title"
                type="text"
                value={title}
                onChange={(e) => onTitleChange?.(e.target.value)}
                onBlur={() => title.trim().length > 0 && onTitleConfirm?.()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && title.trim().length > 0) {
                    e.preventDefault();
                    onTitleConfirm?.();
                  }
                }}
                placeholder="Titolo"
                className="mb-2 w-full bg-transparent text-sm font-semibold leading-snug text-white placeholder:text-white/70 focus:outline-none sm:text-ds-body-sm"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" }}
              />
              <label className="sr-only" htmlFor="crea-tile-description">Descrizione evento</label>
              <textarea
                id="crea-tile-description"
                value={description}
                onChange={(e) => onDescriptionChange?.(e.target.value)}
                placeholder="descrizione"
                rows={2}
                className="mb-2 w-full resize-none bg-transparent text-xs font-medium text-white placeholder:text-white/60 focus:outline-none sm:text-ds-micro"
                style={{ textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,0.8)" }}
              />
              <div
                className="flex h-1.5 w-full overflow-hidden rounded-full bg-black/60 shadow-inner backdrop-blur-[1px]"
                role="presentation"
              >
                <div
                  className="h-full w-1/2 shrink-0 rounded-l-full"
                  style={{ background: "linear-gradient(90deg, rgb(20 148 132) 0%, rgb(13 148 136) 100%)" }}
                />
                <div
                  className="h-full w-1/2 shrink-0 rounded-r-full"
                  style={{ background: "linear-gradient(90deg, rgb(239 68 68) 0%, rgb(244 63 94) 100%)" }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
