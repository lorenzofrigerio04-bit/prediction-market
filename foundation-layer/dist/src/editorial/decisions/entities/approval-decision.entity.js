import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ApprovalScope } from "../../enums/approval-scope.enum.js";
import { createApprovalScore } from "../../value-objects/approval-score.vo.js";
export const createApprovalDecision = (input) => {
    if (!Object.values(ApprovalScope).includes(input.approval_scope)) {
        throw new ValidationError("INVALID_APPROVAL_DECISION", "approval_scope is invalid");
    }
    return deepFreeze({
        ...input,
        publication_readiness_score: createApprovalScore(input.publication_readiness_score),
    });
};
//# sourceMappingURL=approval-decision.entity.js.map