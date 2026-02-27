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
/** Come INPUT_BOX_CLASS ma testo inserito minuscolo; solo placeholder maiuscolo (per Titolo e Descrizione) */
const INPUT_BOX_CLASS_NORMAL_CASE =
  "flex items-center rounded-md border border-white/30 bg-black/70 px-2 py-0.5 font-sans text-xs font-semibold tracking-wide text-white shadow-[0_2px_6px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:text-ds-micro placeholder:uppercase placeholder:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent text-center truncate normal-case";

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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const scadenzaInputRef = useRef<HTMLInputElement>(null);
  const resolutionInputRef = useRef<HTMLInputElement>(null);
  const { setFrozenIndex } = useLandingBackground();

  const scrollInputIntoView = (el: HTMLInputElement | null) => {
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    });
  };

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
      const target = e.target as Node;
      if (categoryRef.current && !categoryRef.current.contains(target)) {
        const listEl = document.getElementById("crea-category-list");
        if (listEl && !listEl.contains(target)) setCategoryOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
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
            <>
              <div
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm crea-category-overlay-fade"
                aria-hidden
                onClick={() => setCategoryOpen(false)}
              />
              <div
                id="crea-category-list"
                role="listbox"
                aria-label="Opzioni categoria"
                className="fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] top-[20%] z-[101] flex flex-col rounded-2xl border border-white/15 bg-black/95 backdrop-blur-xl shadow-2xl overflow-hidden crea-category-modal-anim sm:left-0 sm:right-auto sm:top-full sm:bottom-auto sm:absolute sm:mt-1.5 sm:min-w-[200px] sm:max-h-[min(320px,70vh)]"
              >
                <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">Categoria</span>
                  <button
                    type="button"
                    onClick={() => setCategoryOpen(false)}
                    className="p-2 -m-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Chiudi"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2 -webkit-overflow-scrolling-touch">
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
                          requestAnimationFrame(() => {
                            titleInputRef.current?.focus();
                            scrollInputIntoView(titleInputRef.current);
                          });
                        }}
                        className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                          isSelected ? "bg-primary/25 text-primary" : "text-white hover:bg-white/10 active:bg-white/15"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
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
            ref={scadenzaInputRef}
            type="date"
            value={dateInputValue}
            min={minDateValue}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                onClosesAtChange(new Date(v).toISOString());
                requestAnimationFrame(() => resolutionInputRef.current?.focus());
              }
            }}
            onBlur={() => requestAnimationFrame(() => resolutionInputRef.current?.focus())}
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
              ref={titleInputRef}
              id="crea-home-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onBlur={() => title.trim().length > 0 && onTitleConfirm?.()}
              onFocus={() => scrollInputIntoView(titleInputRef.current)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim().length > 0) {
                  e.preventDefault();
                  onTitleConfirm?.();
                  requestAnimationFrame(() => descriptionInputRef.current?.focus());
                }
              }}
              placeholder="TITOLO"
              className={`${BOX_SIZE} ${INPUT_BOX_CLASS_NORMAL_CASE} crea-home-input-scroll-margin ${BOX_TRANSITION} ${titleDone ? BOX_DONE_GLOW : ""}`}
              style={TITLE_STYLE}
              aria-label="Titolo dell'evento"
            />
            <input
              ref={descriptionInputRef}
              id="crea-home-description"
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onFocus={() => scrollInputIntoView(descriptionInputRef.current)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  requestAnimationFrame(() => {
                    const dateInput = scadenzaInputRef.current;
                    if (dateInput) {
                      dateInput.focus();
                      scrollInputIntoView(dateInput);
                      if (typeof dateInput.showPicker === "function") {
                        dateInput.showPicker();
                      }
                    }
                  });
                }
              }}
              placeholder="DESCRIZIONE"
              className={`${BOX_SIZE} ${INPUT_BOX_CLASS_NORMAL_CASE} crea-home-input-scroll-margin ${BOX_TRANSITION} ${descriptionDone ? BOX_DONE_GLOW : ""}`}
              style={DESC_STYLE}
              aria-label="Descrizione dell'evento"
            />
          </div>
          {/* Angolo in basso a destra: Risoluzione — stessa misura degli altri box */}
          <input
            ref={resolutionInputRef}
            id="crea-home-resolution"
            type="url"
            value={resolutionSource}
            onChange={(e) => onResolutionSourceChange(e.target.value)}
            onFocus={() => scrollInputIntoView(resolutionInputRef.current)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                requestAnimationFrame(() => {
                  document.getElementById("crea-confirm-button")?.focus();
                });
              }
            }}
            placeholder="RISOLUZIONE"
            className={`${BOX_SIZE} shrink-0 ${INPUT_BOX_CLASS} crea-home-input-scroll-margin ${BOX_TRANSITION} ${resolutionDone ? BOX_DONE_GLOW : ""}`}
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
