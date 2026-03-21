import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { LearningInsightStatus } from "../../enums/learning-insight-status.enum.js";
import { createLearningRefList, createLearningText, } from "../../value-objects/learning-feedback-shared.vo.js";
export const createLearningInsight = (input) => {
    if (!Object.values(LearningInsightStatus).includes(input.insight_status)) {
        throw new ValidationError("INVALID_LEARNING_INSIGHT", "insight_status is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_LEARNING_INSIGHT", "correlation_id is required");
    }
    const supporting_refs = createLearningRefList(input.supporting_refs, "supporting_refs", 1);
    const derived_recommendation_refs = createLearningRefList(input.derived_recommendation_refs, "derived_recommendation_refs");
    return deepFreeze({
        ...input,
        title: createLearningText(input.title, "title"),
        supporting_refs,
        derived_recommendation_refs,
    });
};
//# sourceMappingURL=learning-insight.entity.js.map