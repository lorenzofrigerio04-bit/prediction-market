import type { EventTemplate } from "./types";

const DEFAULT_CATEGORY = "Intrattenimento" as const;

/**
 * Restituisce la categoria associata all'host (es. governo.it → Politica).
 * Fallback: Intrattenimento.
 */
export function getCategoryFromHost(_host: string): string {
  return DEFAULT_CATEGORY;
}

/**
 * Template specifico per host (opzionale). Se non c'è match, restituisce null.
 */
export function getSpecificTemplateForHost(
  _host: string,
  _authorityType: "OFFICIAL" | "REPUTABLE"
): EventTemplate | null {
  return null;
}

const UNIVERSAL_FALLBACK_TEMPLATE: EventTemplate = {
  id: "universal-fallback",
  category: "Intrattenimento",
  horizonDaysMin: 1,
  horizonDaysMax: 7,
  question: (ctx) =>
    `L'evento da fonte ${ctx.authorityHost} sarà confermato entro la data di chiusura?`,
  resolutionCriteria: (ctx) => ({
    yes: `Confermato da ${ctx.authorityHost} entro la data di chiusura.`,
    no: `Non confermato da ${ctx.authorityHost} entro la data di chiusura.`,
  }),
};

/**
 * Template universale di fallback (categoria Intrattenimento, no News).
 */
export function getUniversalFallbackTemplate(): EventTemplate {
  return UNIVERSAL_FALLBACK_TEMPLATE;
}
