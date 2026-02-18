"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { getCategoryImagePath, slugifyCategory } from "@/lib/category-slug";

const CATEGORY_GRADIENTS: Record<string, string> = {
  politica: "linear-gradient(135deg, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.3) 100%)",
  economia: "linear-gradient(135deg, rgba(34,197,94,0.4) 0%, rgba(20,184,166,0.3) 100%)",
  finanza: "linear-gradient(135deg, rgba(245,158,11,0.4) 0%, rgba(217,119,6,0.3) 100%)",
  sport: "linear-gradient(135deg, rgba(239,68,68,0.35) 0%, rgba(249,115,22,0.3) 100%)",
  tecnologia: "linear-gradient(135deg, rgba(14,165,233,0.4) 0%, rgba(59,130,246,0.3) 100%)",
  cronaca: "linear-gradient(135deg, rgba(107,114,128,0.45) 0%, rgba(75,85,99,0.35) 100%)",
  cultura: "linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(139,92,246,0.3) 100%)",
  scienza: "linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(14,165,233,0.3) 100%)",
  intrattenimento: "linear-gradient(135deg, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.3) 100%)",
};

function getCategoryGradient(category: string): string {
  const slug = slugifyCategory(category);
  return CATEGORY_GRADIENTS[slug] ?? "linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(148,163,184,0.25) 100%)";
}

interface CategoryBoxesProps {
  categories: string[];
  /** Se true, aggiunge il box "Tutti" che porta a /discover/tutti */
  showTutti?: boolean;
}

export default function CategoryBoxes({ categories, showTutti = true }: CategoryBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const boxes = container.querySelectorAll("[data-category-index]");
    if (boxes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indexStr = (entry.target as HTMLElement).getAttribute("data-category-index");
          if (indexStr === null) return;
          const index = parseInt(indexStr, 10);
          if (entry.isIntersecting) {
            setFocusedIndex((prev) => {
              const rootBounds = entry.rootBounds;
              const rect = entry.boundingClientRect;
              if (!rootBounds) return index;
              const centerY = rect.top + rect.height / 2;
              const viewCenter = rootBounds.top + rootBounds.height * 0.4;
              if (centerY <= viewCenter + 80) return index;
              return prev;
            });
          }
        });
      },
      {
        root: null,
        rootMargin: "-15% 0px -40% 0px",
        threshold: [0, 0.2, 0.5, 0.8, 1],
      }
    );

    boxes.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories.length, showTutti]);

  const list = showTutti ? ["Tutti", ...categories] : categories;

  return (
    <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {list.map((category, index) => {
        const isTutti = category === "Tutti";
        const slug = isTutti ? "tutti" : slugifyCategory(category);
        const href = `/discover/${slug}`;
        const imagePath = isTutti ? null : getCategoryImagePath(category);
        const gradient = isTutti
          ? "linear-gradient(135deg, rgba(59,130,246,0.45) 0%, rgba(139,92,246,0.35) 100%)"
          : getCategoryGradient(category);
        const isFocused = focusedIndex === index;

        return (
          <Link
            key={isTutti ? "tutti" : category}
            href={href}
            data-category-index={index}
            className="relative block rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none transition-all duration-500 ease-out min-h-[120px] sm:min-h-[140px] active:scale-[0.99]"
            style={{
              transform: isFocused ? "scale(1.05)" : "scale(1)",
              boxShadow: isFocused
                ? "0 16px 48px -12px rgba(59,130,246,0.3)"
                : "0 4px 20px -8px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: imagePath ? `url(${imagePath})` : undefined,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: imagePath
                  ? "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.7) 100%)"
                  : gradient,
              }}
            />
            <div className="relative flex flex-col justify-end p-4 h-full min-h-[120px] sm:min-h-[140px]">
              <span className="text-lg sm:text-xl font-bold text-white drop-shadow-md tracking-tight">
                {category}
              </span>
              {!isTutti && (
                <span className="text-sm text-white/85 mt-0.5">Esplora eventi</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
