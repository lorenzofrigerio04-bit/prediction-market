"use client";

import { useState, useRef, useEffect } from "react";

const DEFAULT_CATEGORIES = ["Sport", "Politica", "Economia", "Tecnologia", "Cultura", "Scienza", "Intrattenimento"];

export interface CreaEventStepBoxesProps {
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  title: string;
  onTitleChange: (value: string) => void;
  onTitleConfirm: () => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  step1Done: boolean;
  step2Done: boolean;
  step3Done: boolean;
}

export default function CreaEventStepBoxes({
  category,
  onCategoryChange,
  categories,
  title,
  onTitleChange,
  onTitleConfirm,
  description,
  onDescriptionChange,
  step1Done,
  step2Done,
  step3Done,
}: CreaEventStepBoxesProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  const categoryOptions = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  useEffect(() => {
    if (!categoryOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryOpen]);

  const activeStep = !step1Done ? 1 : !step2Done ? 2 : 3;

  const inputBaseClass =
    "w-full bg-transparent text-white placeholder:text-white/50 focus:outline-none text-sm sm:text-ds-body-sm";
  const labelClass = "block text-xs font-semibold text-white/70 mb-1.5 uppercase tracking-wide";

  return (
    <div className="flex flex-col items-center gap-0 w-full max-w-[320px] sm:max-w-[360px]">
      {/* Box 1: Categoria */}
      <div
        className={`crea-step-box w-full ${activeStep === 1 ? "crea-step-box--active" : ""}`}
        data-step={1}
      >
        <label className={labelClass}>1. Categoria</label>
        <div ref={categoryRef} className="relative">
          <button
            type="button"
            onClick={() => setCategoryOpen((o) => !o)}
            className="w-full text-left px-0 py-0.5 min-h-[2rem] text-white font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            aria-expanded={categoryOpen}
            aria-haspopup="listbox"
          >
            {category || "Seleziona categoria"}
          </button>
          {categoryOpen && (
            <div
              className="absolute left-0 top-full z-50 mt-1.5 min-w-[180px] py-1.5 rounded-xl border border-white/15 bg-black/80 backdrop-blur-md shadow-xl max-h-[min(260px,60vh)] overflow-y-auto"
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
                      onCategoryChange(opt);
                      setCategoryOpen(false);
                    }}
                    className={`w-full px-3 sm:px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                      isSelected ? "bg-primary/20 text-primary" : "text-white hover:bg-white/10"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="crea-step-arrow" aria-hidden>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Box 2: Titolo */}
      <div
        className={`crea-step-box w-full ${activeStep === 2 ? "crea-step-box--active" : ""}`}
        data-step={2}
      >
        <label htmlFor="crea-step-title" className={labelClass}>2. Titolo</label>
        <input
          id="crea-step-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => title.trim().length > 0 && onTitleConfirm()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim().length > 0) {
              e.preventDefault();
              onTitleConfirm();
            }
          }}
          placeholder="Titolo dell'evento"
          className={inputBaseClass}
        />
      </div>

      <div className="crea-step-arrow" aria-hidden>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Box 3: Descrizione */}
      <div
        className={`crea-step-box w-full ${activeStep === 3 ? "crea-step-box--active" : ""}`}
        data-step={3}
      >
        <label htmlFor="crea-step-description" className={labelClass}>3. Descrizione</label>
        <textarea
          id="crea-step-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descrizione dell'evento"
          rows={2}
          className={`${inputBaseClass} resize-none`}
        />
      </div>
    </div>
  );
}
