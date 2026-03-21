import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
const assertScore01 = (value, field) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_CONFIDENCE_SCORE", `${field} must be within [0,1]`, {
            field,
            value,
        });
    }
};
export const createTemporalWindow = (input) => {
    if (Date.parse(input.start_at) > Date.parse(input.end_at)) {
        throw new ValidationError("INVALID_TEMPORAL_WINDOW", "start_at must be less than or equal to end_at", input);
    }
    return deepFreeze(input);
};
export const createEvidenceSpan = (input) => {
    if (input.span_id.trim().length === 0 || input.locator.trim().length === 0) {
        throw new ValidationError("INVALID_EVIDENCE_SPAN", "span_id and locator must be non-empty");
    }
    if (input.start_offset !== null &&
        input.end_offset !== null &&
        input.end_offset < input.start_offset) {
        throw new ValidationError("INVALID_EVIDENCE_SPAN", "end_offset must be greater than or equal to start_offset", input);
    }
    return deepFreeze({
        ...input,
        span_id: input.span_id.trim(),
        locator: input.locator.trim(),
    });
};
export const createSubjectReference = (input) => {
    if (input.value.trim().length === 0 ||
        input.normalized_value.trim().length === 0 ||
        input.entity_type.trim().length === 0) {
        throw new ValidationError("INVALID_SUBJECT_REFERENCE", "value, normalized_value and entity_type must be non-empty");
    }
    return deepFreeze({
        ...input,
        value: input.value.trim(),
        normalized_value: input.normalized_value.trim(),
        entity_type: input.entity_type.trim(),
    });
};
export const createActionReference = (input) => {
    if (input.value.trim().length === 0 || input.normalized_value.trim().length === 0) {
        throw new ValidationError("INVALID_ACTION_REFERENCE", "value and normalized_value must be non-empty");
    }
    return deepFreeze({
        ...input,
        value: input.value.trim(),
        normalized_value: input.normalized_value.trim(),
    });
};
export const createObjectReference = (input) => {
    if (input.value.trim().length === 0 || input.normalized_value.trim().length === 0) {
        throw new ValidationError("INVALID_OBJECT_REFERENCE", "value and normalized_value must be non-empty");
    }
    return deepFreeze({
        ...input,
        value: input.value.trim(),
        normalized_value: input.normalized_value.trim(),
        entity_type_nullable: input.entity_type_nullable === null ? null : input.entity_type_nullable.trim(),
    });
};
export const createJurisdictionReference = (input) => {
    if (!/^[A-Z]{2,8}$/.test(input.code)) {
        throw new ValidationError("INVALID_JURISDICTION_REFERENCE", "code must match /^[A-Z]{2,8}$/");
    }
    return deepFreeze({
        ...input,
        code: input.code,
        label_nullable: input.label_nullable === null ? null : input.label_nullable.trim(),
    });
};
export const createSimilarityScore = (input) => {
    assertScore01(input.score, "score");
    return deepFreeze(input);
};
export const createGraphMetadata = (input) => {
    if (!Number.isInteger(input.relation_count) || input.relation_count < 0) {
        throw new ValidationError("INVALID_GRAPH_METADATA", "relation_count must be a non-negative integer", { relation_count: input.relation_count });
    }
    return deepFreeze({
        ...input,
        created_from_candidate_ids: [...input.created_from_candidate_ids],
    });
};
export const createConflictDescriptor = (input) => {
    if (input.field.trim().length === 0) {
        throw new ValidationError("INVALID_CONFLICT_DESCRIPTOR", "field must be non-empty");
    }
    return deepFreeze({
        ...input,
        field: input.field.trim(),
    });
};
export const createNormalizationMetadata = (input) => {
    if (input.strategy_id.trim().length === 0 || input.resolver_version.trim().length === 0) {
        throw new ValidationError("INVALID_NORMALIZATION_METADATA", "strategy_id and resolver_version must be non-empty");
    }
    return deepFreeze({
        strategy_id: input.strategy_id.trim(),
        resolver_version: input.resolver_version.trim(),
    });
};
export const assertConfidence01 = assertScore01;
//# sourceMappingURL=shared-domain.vo.js.map