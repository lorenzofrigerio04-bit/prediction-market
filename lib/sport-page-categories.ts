/**
 * Categorie della pagina /sport: solo eventi realtime (open, closesAt > now).
 * Calcio, Basket (Pallacanestro), F1 (Formula 1), MotoGP, Tennis.
 */

export const SPORT_PAGE_CATEGORIES = [
  "Calcio",
  "Formula 1",
  "MotoGP",
  "Tennis",
  "Pallacanestro",
] as const;

export type SportPageCategory = (typeof SPORT_PAGE_CATEGORIES)[number];

/** Nome da mostrare in tab/UI (Basket, F1, ecc.) */
export const SPORT_PAGE_DISPLAY_NAMES: Record<SportPageCategory, string> = {
  Calcio: "Calcio",
  Pallacanestro: "Basket",
  "Formula 1": "F1",
  MotoGP: "MotoGP",
  Tennis: "Tennis",
};

export function getSportPageDisplayName(category: SportPageCategory): string {
  return SPORT_PAGE_DISPLAY_NAMES[category] ?? category;
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
