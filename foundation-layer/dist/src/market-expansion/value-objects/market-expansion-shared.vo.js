import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";
import { createScore01 } from "../../market-design/value-objects/score.vo.js";
export const createFamilyKey = (value) => assertNonEmpty(value, "family_key");
export const createSourceContextRef = (value) => assertNonEmpty(value, "source_context_ref");
export const createMarketRef = (value) => assertNonEmpty(value, "market_ref");
export const createRelationRef = (value) => assertNonEmpty(value, "relation_ref");
export const createSelectionReason = (value) => assertNonEmpty(value, "selection_reason");
export const createAntiCannibalizationPolicy = (value) => assertNonEmpty(value, "anti_cannibalization_policy");
export const createExpansionNote = (value) => assertNonEmpty(value, "expansion_note");
export const createConfidenceScore01 = (value, field) => createScore01(value, field);
export const createRelationshipStrengthScore01 = (value, field) => createScore01(value, field);
export const createDependencyStrength = (value) => createScore01(value, "dependency_strength");
export const createStrategicPriority = (value) => {
    if (!Number.isInteger(value) || value < 1 || value > 10) {
        throw new ValidationError("INVALID_STRATEGIC_PRIORITY", "strategic_priority must be an integer in [1,10]");
    }
    return value;
};
export const createDistinctMarketRefs = (refs, fieldName) => {
    const normalized = refs.map((ref) => createMarketRef(ref));
    if (new Set(normalized).size !== normalized.length) {
        throw new ValidationError("DUPLICATE_MARKET_REFS", `${fieldName} must contain unique values`, {
            fieldName,
        });
    }
    return Object.freeze([...normalized]);
};
//# sourceMappingURL=market-expansion-shared.vo.js.map