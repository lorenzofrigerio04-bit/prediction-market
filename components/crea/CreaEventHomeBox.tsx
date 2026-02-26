"use client";

import { useState, useRef, useEffect } from "react";
import CreaEventBoxShell from "@/components/crea/CreaEventBoxShell";
import { useLandingBackground, CATEGORY_TO_BACKGROUND_INDEX } from "@/components/landing/LandingBackgroundCarousel";

const DEFAULT_CATEGORIES = ["Sport", "Politica", "Economia", "Tecnologia", "Cultura", "Scienza", "Intrattenimento"];

/** Stessa misura per tutti i box: contorno uguale alla parola (stessa larghezza e altezza) */
const BOX_SIZE = "w-[7.25rem] min-w-[7.25rem] h-[2rem] min-h-[2rem]";
/** Stile unico per tutti i box (come CATEGORIA): titolo maiuscolo, stesso colore (text-white), stesso font */
const BADGE_BOX_CLASS =
  "inline-flex items-center justify-center rounded-md border border-white/30 bg-black/70 px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro";
const INPUT_BOX_CLASS =
  "flex items-center rounded-md border border-white/30 bg-black/70 px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro placeholder:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-center truncate";

function formatScadenzaDisplay(value: string): string {
  if (!value) return "SCADENZA";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "SCADENZA";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function toDateInputValue(closesAt: string): string {
  if (!closesAt) return "";
  const d = new Date(closesAt);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const TITLE_STYLE = { textShadow: "0 2px 8px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,0.9)" };
const DESC_STYLE = { textShadow: "0 1px 4px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,0.8)" };

const BOX_DONE_GLOW = "!border-emerald-400/90 !shadow-[0_0_14px_rgba(52,211,153,0.5)]";
const BOX_TRANSITION = "transition-all duration-300";

export interface CreaEventHomeBoxProps {
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  title: string;
  onTitleChange: (value: string) => void;
  onTitleConfirm?: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  closesAt: string;
  onClosesAtChange: (value: string) => void;
  resolutionSource: string;
  onResolutionSourceChange: (value: string) => void;
  minDate?: string;
}

export default function CreaEventHomeBox({
  category,
  onCategoryChange,
  categories,
  title,
  onTitleChange,
  onTitleConfirm,
  description,
  onDescriptionChange,
  closesAt,
  onClosesAtChange,
  resolutionSource,
  onResolutionSourceChange,
  minDate,
}: CreaEventHomeBoxProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const { setFrozenIndex } = useLandingBackground();

  const categoryOptions = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const dateInputValue = toDateInputValue(closesAt);
  const minDateValue = minDate ? toDateInputValue(minDate) : "";
  const scadenzaDisplay = formatScadenzaDisplay(closesAt);

  const categoryDone = !!category;
  const titleDone = title.trim().length > 0;
  const descriptionDone = description.trim().length > 0;
  const scadenzaDone = !!dateInputValue;
  const resolutionDone = resolutionSource.trim().length > 0;

  useEffect(() => {
    if (!categoryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryOpen]);

  return (
    <CreaEventBoxShell category={category}>
      {/* Riga in alto: CATEGORIA (sx) e Scadenza (dx) — box identici come nei card evento (z-20 così il date picker riceve i click) */}
      <div className="relative z-20 flex justify-between items-start gap-2 shrink-0">
        <div ref={categoryRef} className="relative">
          <button
            type="button"
            onClick={() => setCategoryOpen((o) => !o)}
            className={`${BADGE_BOX_CLASS} ${BOX_SIZE} hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${BOX_TRANSITION} ${categoryDone ? BOX_DONE_GLOW : ""}`}
            aria-expanded={categoryOpen}
            aria-haspopup="listbox"
          >
            <span className="truncate uppercase">{category ? category.toUpperCase() : "CATEGORIA"}</span>
          </button>
          {categoryOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1.5 min-w-[160px] py-1.5 rounded-xl border border-white/15 bg-black/90 backdrop-blur-md shadow-xl max-h-[min(260px,50vh)] overflow-y-auto"
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
                      onCategoryChange(opt);
                      setCategoryOpen(false);
                    }}
                    className={`w-full px-3 sm:px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      isSelected ? "bg-primary/25 text-primary" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Box Scadenza a destra — label "Scadenza", tap apre calendario */}
        <div className={`relative inline-flex ${BOX_SIZE}`}>
          <span
            className={`${BADGE_BOX_CLASS} pointer-events-none w-full h-full ${BOX_TRANSITION} ${!dateInputValue ? "text-white/80" : ""} ${scadenzaDone ? BOX_DONE_GLOW : ""}`}
            aria-hidden
          >
            <span className="truncate">{scadenzaDisplay}</span>
          </span>
          <input
            type="date"
            value={dateInputValue}
            min={minDateValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v) onClosesAtChange(new Date(v).toISOString());
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ colorScheme: "dark" }}
            aria-label="Scadenza: apri calendario"
          />
        </div>
      </div>

      {/* Angolo in basso a sinistra: Titolo e Descrizione */}
      <div className="flex flex-col justify-end min-h-0 flex-1">
        <div className="flex flex-row justify-between items-end gap-3 mt-auto">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <input
              id="crea-home-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => title.trim().length > 0 && onTitleConfirm?.()}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim().length > 0) {
                  e.preventDefault();
                  onTitleConfirm?.();
                }
              }}
              placeholder="TITOLO"
              className={`${BOX_SIZE} ${INPUT_BOX_CLASS} ${BOX_TRANSITION} ${titleDone ? BOX_DONE_GLOW : ""}`}
              style={TITLE_STYLE}
              aria-label="Titolo dell'evento"
            />
            <input
              id="crea-home-description"
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="DESCRIZIONE"
              className={`${BOX_SIZE} ${INPUT_BOX_CLASS} ${BOX_TRANSITION} ${descriptionDone ? BOX_DONE_GLOW : ""}`}
              style={DESC_STYLE}
              aria-label="Descrizione dell'evento"
            />
          </div>
          {/* Angolo in basso a destra: Risoluzione — stessa misura degli altri box */}
          <input
            id="crea-home-resolution"
            type="url"
            value={resolutionSource}
            onChange={(e) => onResolutionSourceChange(e.target.value)}
            placeholder="RISOLUZIONE"
            className={`${BOX_SIZE} shrink-0 ${INPUT_BOX_CLASS} ${BOX_TRANSITION} ${resolutionDone ? BOX_DONE_GLOW : ""}`}
            style={DESC_STYLE}
            aria-label="Link per risoluzione dell'evento"
          />
        </div>
        <div
          className="flex h-1.5 w-full overflow-hidden rounded-full bg-black/60 shadow-inner backdrop-blur-[1px] mt-2"
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
      </div>
    </CreaEventBoxShell>
  );
}
