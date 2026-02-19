const CATEGORY_TO_SLUG: Record<string, string> = {
  Politica: "politica",
  Cultura: "cultura",
  Sport: "sport",
  Tecnologia: "tecnologia",
  Economia: "economia",
  Scienza: "scienza",
  Intrattenimento: "intrattenimento",
};

export function categoryToSlug(category: string): string {
  return CATEGORY_TO_SLUG[category] ?? category.toLowerCase().replace(/\s+/g, "-");
}

/** Alias per compatibilità con componenti che usavano slugifyCategory. */
export const slugifyCategory = categoryToSlug;

export function getCategoryImagePath(category: string): string {
  const slug = categoryToSlug(category);
  return `/categories/${slug}.png`;
}

/** Gradiente/colore di fallback quando l'immagine categoria non è disponibile (stesso ordine usato in discover). */
const CATEGORY_FALLBACK_BG: Record<string, string> = {
  Politica: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)",
  Cultura: "linear-gradient(135deg, #4a1942 0%, #6b2d63 100%)",
  Sport: "linear-gradient(135deg, #0d5c2e 0%, #1a8c45 100%)",
  Tecnologia: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  Economia: "linear-gradient(135deg, #3d2c1e 0%, #6b4423 100%)",
  Scienza: "linear-gradient(135deg, #2c1f4a 0%, #4a3f6b 100%)",
  Intrattenimento: "linear-gradient(135deg, #5c1a1a 0%, #8b2a2a 100%)",
};

export function getCategoryFallbackGradient(category: string): string {
  return CATEGORY_FALLBACK_BG[category] ?? "linear-gradient(135deg, #374151 0%, #1f2937 100%)";
}

const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_TO_SLUG).map(([cat, slug]) => [slug, cat])
);

/**
 * Restituisce il nome categoria corrispondente allo slug (es. "sport" -> "Sport").
 * Se viene passata la lista di categorie dall'API, restituisce solo se la categoria è in lista.
 */
export function getCategoryNameFromSlug(slug: string, categories?: string[]): string | null {
  const fromMap = SLUG_TO_CATEGORY[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
  if (!categories || categories.length === 0) return fromMap;
  const match = categories.find((c) => categoryToSlug(c) === slug);
  return match ?? (categories.includes(fromMap) ? fromMap : null);
}
