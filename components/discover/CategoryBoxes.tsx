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
  showTutti?: boolean;
}

export default function CategoryBoxes({ categories, showTutti = true }: CategoryBoxesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            const list = showTutti ? ["Tutti", ...categories] : categories;
            list.forEach((_, index) => {
              setTimeout(() => {
                setVisibleItems((prev) => new Set([...prev, index]));
              }, index * 120);
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [categories, showTutti, hasAnimated]);

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
        const isVisible = visibleItems.has(index);

        return (
          <Link
            key={isTutti ? "tutti" : category}
            href={href}
            data-category-index={index}
            className="category-box-item relative block rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-card focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none min-h-[120px] sm:min-h-[140px] active:scale-[0.99] hover:border-primary/20 hover:shadow-glow-sm hover:scale-[1.02]"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? "translateY(0) scale(1)"
                : "translateY(24px) scale(0.95)",
              transition: `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)`,
            }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
              style={{
                backgroundImage: imagePath ? `url(${imagePath})` : undefined,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: imagePath
                  ? "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.72) 100%)"
                  : gradient,
              }}
            />
            <div className="relative flex flex-col justify-end p-4 h-full min-h-[120px] sm:min-h-[140px]">
              <span className="text-lg sm:text-xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-tight">
                {category}
              </span>
              {!isTutti && (
                <span className="text-sm text-white/90 mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                  Esplora eventi
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
