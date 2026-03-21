import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
export const createCandidateMarket = (input) => {
    if (input.title.trim().length === 0 || input.slug.trim().length === 0) {
        throw new ValidationError("INVALID_MARKET_METADATA", "title and slug are required");
    }
    if (!/^clm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$/.test(input.claimId)) {
        throw new ValidationError("INVALID_CLAIM_ID", "claimId must follow the clm_ prefixed format");
    }
    if (!/^evt_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$/.test(input.canonicalEventId)) {
        throw new ValidationError("INVALID_EVENT_ID", "canonicalEventId must follow the evt_ prefixed format");
    }
    if (!Number.isFinite(input.confidenceScore) ||
        input.confidenceScore < 0 ||
        input.confidenceScore > 1) {
        throw new ValidationError("INVALID_CONFIDENCE_SCORE", "confidenceScore must be in [0,1]");
    }
    if (Date.parse(input.resolutionWindow.openAt) > Date.parse(input.resolutionWindow.closeAt)) {
        throw new ValidationError("INVALID_RESOLUTION_WINDOW", "resolutionWindow openAt must be <= closeAt");
    }
    if (input.outcomes.length < 2) {
        throw new ValidationError("INSUFFICIENT_OUTCOMES", "CandidateMarket requires at least two outcomes");
    }
    const orderSet = new Set();
    const labelSet = new Set();
    for (const outcome of input.outcomes) {
        if (orderSet.has(outcome.orderIndex)) {
            throw new ValidationError("DUPLICATE_OUTCOME_ORDER_INDEX", "Outcome orderIndex must be unique");
        }
        orderSet.add(outcome.orderIndex);
        const labelKey = normalizeKey(outcome.label);
        if (labelSet.has(labelKey)) {
            throw new ValidationError("DUPLICATE_OUTCOME_LABEL", "Outcome labels must be unique after normalization");
        }
        labelSet.add(labelKey);
    }
    return deepFreeze(input);
};
//# sourceMappingURL=candidate-market.entity.js.map