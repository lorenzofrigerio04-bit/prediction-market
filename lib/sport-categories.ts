/**
 * Categorie sport (Calcio, Tennis, Pallacanestro, Pallavolo, Formula 1, MotoGP).
 * Usate per filtrare la piattaforma e mostrare solo gli eventi sport creati con seed-100-eventi-sport-domusbet.
 */

export const SPORT_CATEGORIES = [
  "Calcio",
  "Tennis",
  "Pallacanestro",
  "Pallavolo",
  "Formula 1",
  "MotoGP",
] as const;

export type SportCategory = (typeof SPORT_CATEGORIES)[number];

/** Condizione Prisma per filtrare solo eventi sport. */
export const SPORT_CATEGORY_FILTER = {
  category: { in: [...SPORT_CATEGORIES] as string[] },
};
