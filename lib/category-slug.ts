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

export function getCategoryImagePath(category: string): string {
  const slug = categoryToSlug(category);
  return `/categories/${slug}.png`;
}
