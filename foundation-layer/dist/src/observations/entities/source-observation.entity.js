import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createSourceObservation = (input) => {
    if (Date.parse(input.ingestedAt) < Date.parse(input.observedAt)) {
        throw new ValidationError("INVALID_SOURCE_OBSERVATION", "ingestedAt must be greater than or equal to observedAt", { observedAt: input.observedAt, ingestedAt: input.ingestedAt });
    }
    if (input.evidenceSpans.length === 0) {
        throw new ValidationError("INVALID_SOURCE_OBSERVATION", "evidenceSpans must contain at least one evidence span");
    }
    const normalizedHeadlineNullable = input.normalizedHeadlineNullable === null ? null : input.normalizedHeadlineNullable.trim();
    const normalizedSummaryNullable = input.normalizedSummaryNullable === null ? null : input.normalizedSummaryNullable.trim();
    if (normalizedHeadlineNullable !== null && normalizedHeadlineNullable.length === 0) {
        throw new ValidationError("INVALID_SOURCE_OBSERVATION", "normalizedHeadlineNullable cannot be empty when provided");
    }
    if (normalizedSummaryNullable !== null && normalizedSummaryNullable.length === 0) {
        throw new ValidationError("INVALID_SOURCE_OBSERVATION", "normalizedSummaryNullable cannot be empty when provided");
    }
    return deepFreeze({
        ...input,
        normalizedHeadlineNullable,
        normalizedSummaryNullable,
        extractedEntities: [...input.extractedEntities],
        extractedDates: [...input.extractedDates],
        extractedNumbers: [...input.extractedNumbers],
        extractedClaims: [...input.extractedClaims],
        jurisdictionCandidates: [...input.jurisdictionCandidates],
        evidenceSpans: [...input.evidenceSpans],
    });
};
//# sourceMappingURL=source-observation.entity.js.map