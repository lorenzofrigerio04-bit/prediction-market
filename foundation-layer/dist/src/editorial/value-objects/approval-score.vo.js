import { ValidationError } from "../../common/errors/validation-error.js";
export const createApprovalScore = (value) => {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new ValidationError("INVALID_APPROVAL_SCORE", "publication_readiness_score must be in range [0,100]", { value });
    }
    return value;
};
//# sourceMappingURL=approval-score.vo.js.map