/**
 * Deterministic market validator: reject or flag ambiguous/unresolvable markets before creation.
 */

export { validateMarket } from "./validator";
export type { MarketValidationInput, ValidationResult } from "./types";
export {
  runHardFailRules,
  runNeedsReviewRules,
  checkAmbiguousWording,
  checkMissingResolutionSource,
  checkResolutionSourceDomain,
  checkNonBinary,
  checkTimeIncoherent,
  checkPastEvent,
  checkTooFarFuture,
  checkSubjectiveInterpretation,
  checkMultipleOutcomes,
  checkSourceReliabilityUncertain,
  checkEdgeCaseTiming,
  DEFAULT_VALIDATOR_CONFIG,
} from "./rules";
export type { ValidatorRulesConfig } from "./rules";
