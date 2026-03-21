import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { createLearningTextList, } from "../../value-objects/learning-feedback-shared.vo.js";
export const createLearningCompatibilityResult = (input) => {
    if (!Object.values(LearningCompatibilityTarget).includes(input.target)) {
        throw new ValidationError("INVALID_LEARNING_COMPATIBILITY_RESULT", "target is invalid");
    }
    if (!Object.values(LearningCompatibilityStatus).includes(input.status)) {
        throw new ValidationError("INVALID_LEARNING_COMPATIBILITY_RESULT", "status is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_LEARNING_COMPATIBILITY_RESULT", "correlation_id is required");
    }
    return deepFreeze({
        ...input,
        mapped_artifact: deepFreeze({ ...input.mapped_artifact }),
        notes: createLearningTextList(input.notes, "notes"),
    });
};
//# sourceMappingURL=learning-compatibility-result.entity.js.map