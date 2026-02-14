/**
 * Template notifiche in italiano (Fase 6 – THINGS_TO_DO).
 * Usare questi messaggi quando si creano notifiche lato server.
 */

/** Evento risolto: "L'evento [titolo] è stato risolto: [SÌ/NO]." */
export function eventResolvedMessage(title: string, outcome: "YES" | "NO"): string {
  const result = outcome === "YES" ? "SÌ" : "NO";
  return `L'evento "${title}" è stato risolto: ${result}.`;
}

/** Missione completata: "Missione completata: +[X] crediti." */
export function missionCompletedMessage(credits: number): string {
  return `Missione completata: +${credits} crediti.`;
}

/** Serie a rischio: "La tua serie è a rischio. Fai login per mantenerla." */
export const STREAK_AT_RISK_MESSAGE =
  "La tua serie è a rischio. Fai login per mantenerla.";

export const STREAK_AT_RISK_TITLE = "Serie a rischio";
