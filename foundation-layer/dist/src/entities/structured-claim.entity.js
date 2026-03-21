import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
export const createStructuredClaim = (input) => {
    if (!/^evt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$/.test(input.canonicalEventId)) {
        throw new ValidationError("INVALID_EVENT_ID", "canonicalEventId must follow the evt_ prefixed format");
    }
    if (input.claimText.trim().length === 0 || input.normalizedClaimText.trim().length === 0) {
        throw new ValidationError("INVALID_CLAIM_TEXT", "Claim text fields must be non-empty");
    }
    if (input.claimSubject.trim().length === 0 || input.claimPredicate.trim().length === 0) {
        throw new ValidationError("INVALID_CLAIM_PARTS", "claimSubject and claimPredicate required");
    }
    if (input.sourceRecordIds.length === 0) {
        throw new ValidationError("MISSING_SOURCE_RECORD_IDS", "At least one sourceRecordId is required");
    }
    if (!Number.isFinite(input.confidenceScore) ||
        input.confidenceScore < 0 ||
        input.confidenceScore > 1) {
        throw new ValidationError("INVALID_CONFIDENCE_SCORE", "confidenceScore must be in [0,1]");
    }
    if (Date.parse(input.resolutionWindow.openAt) > Date.parse(input.resolutionWindow.closeAt)) {
        throw new ValidationError("INVALID_RESOLUTION_WINDOW", "resolutionWindow openAt must be <= closeAt");
    }
    const seen = new Set();
    for (const id of input.sourceRecordIds) {
        const key = normalizeKey(id);
        if (seen.has(key)) {
            throw new ValidationError("DUPLICATE_SOURCE_ID", "sourceRecordIds must be unique");
        }
        seen.add(key);
    }
    return deepFreeze(input);
};
//# sourceMappingURL=structured-claim.entity.js.map