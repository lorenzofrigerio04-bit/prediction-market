/**
 * Configurazione modulo attività simulata (bot).
 * Costanti e flag da env per limiti e abilitazione.
 */

/** Prefisso email degli utenti bot (es. bot-1@simulation.internal) */
export const BOT_EMAIL_PREFIX = "bot-";

/** Dominio email degli utenti bot */
export const BOT_EMAIL_DOMAIN = "simulation.internal";

/** Crediti iniziali assegnati a ogni bot alla creazione / al top-up simulato */
export const BOT_INITIAL_CREDITS = 10_000;

/** Abilita l'esecuzione dell'attività simulata (da env: "true" | "1" = true) */
export const ENABLE_SIMULATED_ACTIVITY =
  process.env.ENABLE_SIMULATED_ACTIVITY === "true" ||
  process.env.ENABLE_SIMULATED_ACTIVITY === "1";

/** Massimo numero di previsioni da piazzare per bot per singola esecuzione */
export const MAX_PREDICTIONS_PER_RUN = 5;

/** Massimo numero di commenti da creare per bot per singola esecuzione */
export const MAX_COMMENTS_PER_RUN = 3;

/** Massimo numero di reazioni (like, fire, ecc.) per bot per singola esecuzione */
export const MAX_REACTIONS_PER_RUN = 10;

/** Massimo numero di follow a eventi per bot per singola esecuzione */
export const MAX_FOLLOWS_PER_RUN = 4;
