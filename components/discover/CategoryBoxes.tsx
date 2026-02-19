"use client";

import Link from "next/link";
import { categoryToSlug, getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";

interface CategoryBoxesProps {
  categories: string[];
}

export default function CategoryBoxes({ categories }: CategoryBoxesProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-ds-label font-semibold text-fg-muted mb-3 uppercase tracking-label">
        Categorie
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((category) => {
          const slug = categoryToSlug(category);
          const bgImage = getCategoryImagePath(category);
          const fallbackGradient = getCategoryFallbackGradient(category);
          return (
            <Link
              key={category}
              href={`/discover/${slug}`}
              className="relative block min-h-[100px] rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none group"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: fallbackGradient,
                  backgroundImage: `url(${bgImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-hidden
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" aria-hidden />
              <span className="relative z-10 flex items-center justify-center min-h-[100px] px-3 text-center text-ds-body-sm font-semibold text-white drop-shadow-md">
                {category}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
