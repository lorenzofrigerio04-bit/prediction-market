/**
 * Market type definitions and utilities.
 * Supports binary (YES/NO) and multi-option markets.
 */

import { getEventDisplayTitle as displayTitleFromOutcomesJson } from "./market-types/outcome-schemas";

export const ALL_MARKET_TYPES = [
  "BINARY",
  "MULTIPLE_CHOICE",
  "SCALAR",
  "RANGE",
  "THRESHOLD",
  "LADDER",
  "TIME_TO_EVENT",
  "COUNT_VOLUME",
  "RANKING",
] as const;

export type MarketTypeId = (typeof ALL_MARKET_TYPES)[number];
export const MARKET_TYPE_IDS = ALL_MARKET_TYPES;

export const MARKET_TYPE_LABELS: Record<MarketTypeId, string> = {
  BINARY: "Binario (Sì/No)",
  MULTIPLE_CHOICE: "Scelta multipla (categorico)",
  SCALAR: "Scalare (numerico continuo)",
  RANGE: "Intervalli (range)",
  THRESHOLD: "Soglia singola",
  LADDER: "Ladder (multi-soglia)",
  TIME_TO_EVENT: "Tempo all'evento",
  COUNT_VOLUME: "Conteggio / Volume",
  RANKING: "Classifica / Posizione",
};

export const BINARY_OUTCOME_MARKET_TYPES: MarketTypeId[] = [
  "BINARY",
  "THRESHOLD",
];

export const MULTI_OPTION_MARKET_TYPES: MarketTypeId[] = [
  "MULTIPLE_CHOICE",
  "RANGE",
  "TIME_TO_EVENT",
  "COUNT_VOLUME",
  "RANKING",
];

export function isMarketTypeId(value: string): value is MarketTypeId {
  return ALL_MARKET_TYPES.includes(value as MarketTypeId);
}

export interface OutcomeOption {
  key: string;
  label: string;
}

export function parseOutcomesJson(
  raw: unknown
): OutcomeOption[] | null {
  if (!raw) return null;
  if (!Array.isArray(raw)) {
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parseOutcomesJson(parsed);
      } catch {
        return null;
      }
    }
    return null;
  }
  const valid = raw.filter(
    (item): item is OutcomeOption =>
      item != null &&
      typeof item === "object" &&
      typeof item.key === "string" &&
      typeof item.label === "string"
  );
  return valid.length > 0 ? valid : null;
}

export function getValidOutcomeKeys(outcomes: unknown): string[] {
  const parsed = parseOutcomesJson(outcomes);
  if (!parsed) return [];
  return parsed.map((o) => o.key);
}

/**
 * For multi-option markets, the display title strips the options portion.
 * E.g. "Quanti gol segnerà Lautaro? | 0 | 1 | 2 | 3+" → "Quanti gol segnerà Lautaro?"
 * Also delegates to outcome-schemas for " : opt1 | opt2" titles when outcomes JSON is set.
 */
export function getEventDisplayTitle(title: string, outcomesJson?: unknown): string {
  const t = title.trim();
  if (t.includes(" | ") && t.indexOf(" | ") > 0) {
    return t.slice(0, t.indexOf(" | ")).trim();
  }
  return displayTitleFromOutcomesJson(title, outcomesJson);
}

/**
 * Derive outcomes from title format "Question | Option1 | Option2 | Option3".
 */
export function deriveOutcomesFromTitle(title: string): OutcomeOption[] {
  const parts = title.split(" | ").map((s) => s.trim());
  if (parts.length < 3) return [];
  const options = parts.slice(1);
  return options.map((label, i) => ({
    key: `opt_${i}`,
    label,
  }));
}

export function getMarketTypeLabel(id: MarketTypeId): string {
  return MARKET_TYPE_LABELS[id] ?? id;
}
