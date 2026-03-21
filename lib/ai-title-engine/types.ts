/**
 * Tipi per AI Title Engine: allineati ai tipi canonici in lib/market-types.
 */

import type { MarketTypeId } from "@/lib/market-types";

export {
  MARKET_TYPE_IDS,
  isMarketTypeId,
} from "@/lib/market-types";
export type { MarketTypeId };

/** Alias per compatibilità: risultato LLM può usare MULTI_OUTCOME → mappiamo a MULTIPLE_CHOICE */
export const LEGACY_MARKET_TYPE_MAP: Record<string, MarketTypeId> = {
  MULTI_OUTCOME: "MULTIPLE_CHOICE",
};

export interface AITitleResult {
  market_type: MarketTypeId;
  title: string;
}

export interface EnrichCandidatesOptions {
  /** Massimo numero di candidati per cui chiamare l'LLM in questo run (default da config) */
  maxCalls?: number;
}
