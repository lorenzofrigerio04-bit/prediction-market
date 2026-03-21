import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
import { EventStatus } from "../enums/event-status.enum.js";
const hasDuplicateNormalized = (values) => {
    const seen = new Set();
    for (const value of values) {
        const key = normalizeKey(value);
        if (seen.has(key)) {
            return true;
        }
        seen.add(key);
    }
    return false;
};
export const createEventSignal = (input) => {
    if (Number.isNaN(Date.parse(input.detectedAt))) {
        throw new ValidationError("INVALID_TIMESTAMP", "detectedAt must be a valid timestamp");
    }
    if (input.sourceRecordIds.length === 0) {
        throw new ValidationError("MISSING_SOURCE_RECORD_IDS", "EventSignal requires at least one sourceRecordId");
    }
    if (hasDuplicateNormalized(input.sourceRecordIds)) {
        throw new ValidationError("DUPLICATE_SOURCE_ID", "sourceRecordIds must be unique");
    }
    if (hasDuplicateNormalized(input.jurisdictions)) {
        throw new ValidationError("DUPLICATE_JURISDICTION", "jurisdictions must be unique");
    }
    if (hasDuplicateNormalized(input.involvedEntities)) {
        throw new ValidationError("DUPLICATE_INVOLVED_ENTITY", "involvedEntities must be unique after normalization");
    }
    if (!Number.isFinite(input.confidenceScore) ||
        input.confidenceScore < 0 ||
        input.confidenceScore > 1) {
        throw new ValidationError("INVALID_CONFIDENCE_SCORE", "confidenceScore must be in [0,1]");
    }
    return deepFreeze({
        ...input,
        status: input.status ?? EventStatus.DETECTED,
    });
};
//# sourceMappingURL=event-signal.entity.js.map