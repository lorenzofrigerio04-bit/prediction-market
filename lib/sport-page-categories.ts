/**
 * Categorie della pagina /sport: solo eventi realtime (open, closesAt > now).
 * Calcio, Basket (Pallacanestro), F1 (Formula 1), MotoGP, Tennis.
 */

export const SPORT_PAGE_DEFAULT_CATEGORIES = [
  "Calcio",
  "Formula 1",
  "MotoGP",
  "Tennis",
  "Pallacanestro",
] as const;

export const SPORT_PAGE_CATEGORIES = SPORT_PAGE_DEFAULT_CATEGORIES;
export type SportPageCategory = string;

/** Nome da mostrare in tab/UI (Basket, F1, ecc.) */
export const SPORT_PAGE_DISPLAY_NAMES: Record<string, string> = {
  Calcio: "Calcio",
  Pallacanestro: "Basket",
  "Formula 1": "F1",
  MotoGP: "MotoGP",
  Tennis: "Tennis",
};

export function getSportPageDisplayName(category: SportPageCategory): string {
  return SPORT_PAGE_DISPLAY_NAMES[category] ?? category;
}

function uniqueTrimmed(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }
  return out;
}

/**
 * Costruisce le tab sportive mostrate in /sport.
 * Se il DB contiene categorie nuove, vengono aggiunte automaticamente.
 */
export function buildSportPageCategories(dynamicCategories: string[]): SportPageCategory[] {
  const merged = uniqueTrimmed([
    ...SPORT_PAGE_DEFAULT_CATEGORIES,
    ...dynamicCategories,
  ]);
  const defaultsSet = new Set<string>(SPORT_PAGE_DEFAULT_CATEGORIES);
  const defaultInOrder = SPORT_PAGE_DEFAULT_CATEGORIES.filter((c) =>
    merged.includes(c)
  );
  const extras = merged
    .filter((category) => !defaultsSet.has(category))
    .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));
  return [...defaultInOrder, ...extras];
}

/** Ordine sottosezioni nella tab Calcio (Champions League, Serie A, ecc.). "Altro" per eventi senza lega. */
export const CALCIO_LEAGUE_ORDER = [
  "Champions League",
  "Serie A",
  "Europa League",
  "Conference League",
  "Coppa Italia",
  "Serie B",
  "Altro",
] as const;

export function sortCalcioLeagues(leagueNames: string[]): string[] {
  const order = [...CALCIO_LEAGUE_ORDER];
  const indexOf = (name: string) => {
    const i = order.indexOf(name as (typeof order)[number]);
    return i === -1 ? order.length : i;
  };
  return [...leagueNames].sort((a, b) => indexOf(a) - indexOf(b));
}
