import { ValidationError } from "../../common/errors/validation-error.js";
export const createReviewFinding = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_REVIEW_FINDING", "review_finding must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=review-finding.vo.js.map