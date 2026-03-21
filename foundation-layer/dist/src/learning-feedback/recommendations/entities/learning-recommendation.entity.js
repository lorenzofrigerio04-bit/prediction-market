import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import { createLearningRefList, createLearningText, } from "../../value-objects/learning-feedback-shared.vo.js";
export const createLearningRecommendation = (input) => {
    if (!Object.values(RecommendationStatus).includes(input.status)) {
        throw new ValidationError("INVALID_LEARNING_RECOMMENDATION", "status is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_LEARNING_RECOMMENDATION", "correlation_id is required");
    }
    const blocking_dependency_refs = createLearningRefList(input.blocking_dependency_refs, "blocking_dependency_refs");
    const planned_action_refs = createLearningRefList(input.planned_action_refs, "planned_action_refs");
    if (input.status === RecommendationStatus.READY && blocking_dependency_refs.length > 0) {
        throw new ValidationError("INVALID_LEARNING_RECOMMENDATION", "ready recommendation cannot have blocking_dependency_refs");
    }
    return deepFreeze({
        ...input,
        recommendation_text: createLearningText(input.recommendation_text, "recommendation_text"),
        blocking_dependency_refs,
        planned_action_refs,
    });
};
//# sourceMappingURL=learning-recommendation.entity.js.map