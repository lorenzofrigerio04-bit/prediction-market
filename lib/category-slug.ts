/**
 * Slug per URL delle categorie (es. Politica → politica).
 * Usato per /discover/[category] e per path immagini /categories/{slug}.jpg
 */
export function slugifyCategory(category: string): string {
  return category
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "altre";
}

/** Restituisce il nome categoria da slug confrontando con l'elenco noto */
export function getCategoryNameFromSlug(slug: string, categories: string[]): string | null {
  if (!slug || slug === "tutti") return null;
  const lower = slug.toLowerCase();
  const found = categories.find((c) => slugifyCategory(c) === lower);
  return found ?? null;
}

/** Path immagine categoria (public/categories/{slug}.jpg o .png). Se non esiste, il componente userà un fallback. */
export function getCategoryImagePath(category: string): string {
  const slug = slugifyCategory(category);
  if (slug === "cultura") return "/categories/cultura.png";
  if (slug === "politica") return "/categories/politica.png";
  if (slug === "sport") return "/categories/sport.png";
  if (slug === "tecnologia") return "/categories/tecnologia.png";
  if (slug === "intrattenimento") return "/categories/intrattenimento.png";
  if (slug === "economia") return "/categories/economia.png";
  if (slug === "scienza") return "/categories/scienza.png";
  return `/categories/${slug}.jpg`;
}
