import { ValidationError } from "../common/errors/validation-error.js";
import { ConfidenceTier } from "../enums/confidence-tier.enum.js";
export const createConfidenceScore = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
        throw new ValidationError("INVALID_CONFIDENCE_SCORE", "ConfidenceScore must be within [0,1]", { value });
    }
    return value;
};
export const toConfidenceTier = (score) => {
    if (score < 0.34) {
        return ConfidenceTier.LOW;
    }
    if (score < 0.67) {
        return ConfidenceTier.MEDIUM;
    }
    return ConfidenceTier.HIGH;
};
//# sourceMappingURL=confidence-score.vo.js.map