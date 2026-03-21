import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { ImprovementArtifactType } from "../../enums/improvement-artifact-type.enum.js";
import { createLearningRefList, createLearningTextList, } from "../../value-objects/learning-feedback-shared.vo.js";
export const createImprovementArtifact = (input) => {
    if (!Object.values(ImprovementArtifactType).includes(input.artifact_type)) {
        throw new ValidationError("INVALID_IMPROVEMENT_ARTIFACT", "artifact_type is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_IMPROVEMENT_ARTIFACT", "correlation_id is required");
    }
    const derived_from_refs = createLearningRefList(input.derived_from_refs, "derived_from_refs", 1);
    const safety_constraints = createLearningTextList(input.safety_constraints, "safety_constraints", 1);
    return deepFreeze({
        ...input,
        derived_from_refs,
        safety_constraints,
        rollout_notes: createLearningTextList(input.rollout_notes, "rollout_notes"),
    });
};
//# sourceMappingURL=improvement-artifact.entity.js.map