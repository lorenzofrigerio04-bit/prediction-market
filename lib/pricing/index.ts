/**
 * LMSR Pricing Engine
 * 
 * Exports all LMSR pricing functions and utilities.
 */

// Core LMSR math functions
export {
  cost,
  getPrice,
  buyShares,
  sellShares,
} from "./lmsr";

// Initialization functions
export {
  getBParameter,
  getInitialQuantities,
  type Category,
  type HypeLevel,
} from "./initialization";

// Trade execution (LMSR prediction buy)
export {
  executePredictionBuy,
  validateMarketOpen,
  TradeError,
  type ExecutePredictionBuyParams,
  type ExecutePredictionBuyResult,
  type EventForTrade,
} from "./trade";
