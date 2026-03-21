import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
import { EventStatus } from "../enums/event-status.enum.js";
const assertUniqueNormalized = (values, code, message) => {
    const seen = new Set();
    for (const value of values) {
        const key = normalizeKey(value);
        if (seen.has(key)) {
            throw new ValidationError(code, message, { value });
        }
        seen.add(key);
    }
};
export const createCanonicalEvent = (input) => {
    if (input.title.trim().length === 0) {
        throw new ValidationError("EMPTY_TITLE", "title must be non-empty");
    }
    if (input.slug.trim().length === 0) {
        throw new ValidationError("INVALID_SLUG", "slug must be non-empty");
    }
    if (input.description.trim().length === 0) {
        throw new ValidationError("EMPTY_DESCRIPTION", "description must be non-empty");
    }
    if (!Number.isFinite(input.confidenceScore) ||
        input.confidenceScore < 0 ||
        input.confidenceScore > 1) {
        throw new ValidationError("INVALID_CONFIDENCE_SCORE", "confidenceScore must be in [0,1]");
    }
    if (Number.isNaN(Date.parse(input.firstObservedAt)) ||
        Number.isNaN(Date.parse(input.lastUpdatedAt))) {
        throw new ValidationError("INVALID_TIMESTAMP", "firstObservedAt and lastUpdatedAt must be valid timestamps");
    }
    if (Date.parse(input.firstObservedAt) > Date.parse(input.lastUpdatedAt)) {
        throw new ValidationError("LAST_UPDATED_BEFORE_FIRST_OBSERVED", "firstObservedAt must be <= lastUpdatedAt");
    }
    assertUniqueNormalized(input.supportingSourceRecordIds, "DUPLICATE_SOURCE_ID", "supportingSourceRecordIds must be unique");
    assertUniqueNormalized(input.supportingSignalIds, "DUPLICATE_SIGNAL_ID", "supportingSignalIds must be unique");
    assertUniqueNormalized(input.tags, "DUPLICATE_TAG", "tags must be unique");
    if ([EventStatus.RESOLVED, EventStatus.ARCHIVED].includes(input.status) &&
        input.resolutionWindow === null) {
        throw new ValidationError("MISSING_RESOLUTION_WINDOW", "resolutionWindow required when status is resolved/archived");
    }
    return deepFreeze(input);
};
//# sourceMappingURL=canonical-event.entity.js.map