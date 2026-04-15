"use client";

import type { SportPageCategory } from "@/lib/sport-page-categories";
import {
  getSportPageDisplayName,
} from "@/lib/sport-page-categories";

const iconClass = "w-8 h-8 sm:w-9 sm:h-9 shrink-0";

function IconCalcio() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="16" cy="16" r="6.5" />
      <path d="M16 9.5v13M16 9.5a6.5 6.5 0 0 1 5.5 3M16 9.5a6.5 6.5 0 0 0-5.5 3M9.5 16h13M9.5 16a6.5 6.5 0 0 1 3-5.5M9.5 16a6.5 6.5 0 0 1 3 5.5M20 16a6.5 6.5 0 0 0-3-5.5M20 16a6.5 6.5 0 0 0-3 5.5" />
    </svg>
  );
}

function IconBasket() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="16" cy="16" r="6.5" />
      <path d="M10.2 13.2c1.2-2 3.2-3.2 5.8-3.2s4.6 1.2 5.8 3.2M16 9.5v13M9.5 16h13" />
      <path d="M12 20.5c1.5 1 3.5 1.5 4 1.5s2.5-.5 4-1.5" />
    </svg>
  );
}

function IconF1() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 20h4l2-8 4-4h6l2 4 4 8h2" />
      <path d="M12 12l2 8M20 12l2 8M8 20v2M24 20v2" />
      <circle cx="10" cy="24" r="1.5" />
      <circle cx="22" cy="24" r="1.5" />
    </svg>
  );
}

function IconMotoGP() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="10" cy="22" r="3" />
      <circle cx="22" cy="22" r="3" />
      <path d="M10 22h4l4-10 4-2 2 4-2 10h4" />
      <path d="M14 12l-4 10M18 10v2" />
    </svg>
  );
}

function IconTennis() {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="16" cy="16" r="6.5" />
      <path d="M12.5 12.5c-2 2-3 5-3 7.5s1 5.5 3 7.5c2 2 5 3 7.5 3s5.5-1 7.5-3c2-2 3-5 3-7.5s-1-5.5-3-7.5" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<SportPageCategory, React.ReactNode> = {
  Calcio: <IconCalcio />,
  Pallacanestro: <IconBasket />,
  "Formula 1": <IconF1 />,
  MotoGP: <IconMotoGP />,
  Tennis: <IconTennis />,
};

interface SportCategoryStripProps {
  categories: SportPageCategory[];
  activeCategory: SportPageCategory;
  onSelect: (category: SportPageCategory) => void;
}

export function SportCategoryStrip({
  categories,
  activeCategory,
  onSelect,
}: SportCategoryStripProps) {
  return (
    <nav
      className="sport-category-strip"
      aria-label="Categorie sport"
    >
      <div className="sport-category-strip__inner">
          {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(cat)}
              className={`sport-category-strip__box ${isActive ? "sport-category-strip__box--active" : ""}`}
              aria-pressed={isActive}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="sport-category-strip__icon">
                {CATEGORY_ICONS[cat] ?? <IconCalcio />}
              </span>
              <span className="sport-category-strip__label">
                {getSportPageDisplayName(cat).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
      <div className="sport-category-strip__accent" aria-hidden />
    </nav>
  );
}
