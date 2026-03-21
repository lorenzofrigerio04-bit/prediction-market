/**
 * Market types: definizioni, metadati e helper per i 9 tipi di mercato.
 */

export {
  MARKET_TYPE_IDS,
  MARKET_TYPE_LABELS,
  MARKET_TYPE_DESCRIPTIONS,
  MARKET_TYPE_EXAMPLES,
  SINGLE_OUTCOME_MARKET_TYPES,
  SCALAR_RESOLUTION_MARKET_TYPES,
  LADDER_AS_SEPARATE_EVENTS,
  BINARY_OUTCOME_MARKET_TYPES,
  MULTI_OPTION_MARKET_TYPES,
  isMarketTypeId,
  getMarketTypeLabel,
  getMarketTypeDescription,
  getMarketTypeExample,
} from "./constants";
export type { MarketTypeId } from "./constants";
export type { MarketOutcomeOption, ScalarConfig } from "./outcome-schemas";
export {
  parseOutcomesJson,
  parseScalarConfigJson,
  getValidOutcomeKeys,
  getEventDisplayTitle,
  deriveOutcomesFromTitle,
} from "./outcome-schemas";
