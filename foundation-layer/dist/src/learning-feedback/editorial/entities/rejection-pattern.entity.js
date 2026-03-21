import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { PatternStatus } from "../../enums/pattern-status.enum.js";
import { createLearningRefList } from "../../value-objects/learning-feedback-shared.vo.js";
export const createRejectionPattern = (input) => {
    if (!Object.values(PatternStatus).includes(input.status)) {
        throw new ValidationError("INVALID_REJECTION_PATTERN", "status is invalid");
    }
    return deepFreeze({
        ...input,
        reason_codes: createLearningRefList(input.reason_codes, "reason_codes", 1),
        supporting_refs: createLearningRefList(input.supporting_refs, "supporting_refs", 1),
    });
};
//# sourceMappingURL=rejection-pattern.entity.js.map