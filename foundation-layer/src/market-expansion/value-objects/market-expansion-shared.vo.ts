import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";
import { createScore01 } from "../../market-design/value-objects/score.vo.js";

export type FamilyKey = string;
export type SourceContextRef = string;
export type MarketRef = string;
export type RelationRef = string;
export type SelectionReason = string;
export type AntiCannibalizationPolicy = string;
export type ExpansionNote = string;

export type ConfidenceScore01 = number;
export type RelationshipStrengthScore01 = number;
export type StrategicPriority = number;
export type DerivativeDependencyStrength = number;

export const createFamilyKey = (value: string): FamilyKey =>
  assertNonEmpty(value, "family_key");
export const createSourceContextRef = (value: string): SourceContextRef =>
  assertNonEmpty(value, "source_context_ref");
export const createMarketRef = (value: string): MarketRef => assertNonEmpty(value, "market_ref");
export const createRelationRef = (value: string): RelationRef =>
  assertNonEmpty(value, "relation_ref");
export const createSelectionReason = (value: string): SelectionReason =>
  assertNonEmpty(value, "selection_reason");
export const createAntiCannibalizationPolicy = (value: string): AntiCannibalizationPolicy =>
  assertNonEmpty(value, "anti_cannibalization_policy");
export const createExpansionNote = (value: string): ExpansionNote =>
  assertNonEmpty(value, "expansion_note");

export const createConfidenceScore01 = (value: number, field: string): ConfidenceScore01 =>
  createScore01(value, field);
export const createRelationshipStrengthScore01 = (
  value: number,
  field: string,
): RelationshipStrengthScore01 => createScore01(value, field);
export const createDependencyStrength = (value: number): DerivativeDependencyStrength =>
  createScore01(value, "dependency_strength");
export const createStrategicPriority = (value: number): StrategicPriority => {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new ValidationError(
      "INVALID_STRATEGIC_PRIORITY",
      "strategic_priority must be an integer in [1,10]",
    );
  }
  return value;
};

export const createDistinctMarketRefs = (
  refs: readonly string[],
  fieldName: string,
): readonly MarketRef[] => {
  const normalized = refs.map((ref) => createMarketRef(ref));
  if (new Set(normalized).size !== normalized.length) {
    throw new ValidationError("DUPLICATE_MARKET_REFS", `${fieldName} must contain unique values`, {
      fieldName,
    });
  }
  return Object.freeze([...normalized]);
};
