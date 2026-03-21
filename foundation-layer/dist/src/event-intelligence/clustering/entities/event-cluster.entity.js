import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { assertConfidence01 } from "../../value-objects/shared-domain.vo.js";
export const createEventCluster = (input) => {
    if (input.candidate_ids.length === 0) {
        throw new ValidationError("INVALID_EVENT_CLUSTER", "candidate_ids must contain at least one id");
    }
    if (new Set(input.candidate_ids).size !== input.candidate_ids.length) {
        throw new ValidationError("INVALID_EVENT_CLUSTER", "candidate_ids must be unique");
    }
    assertConfidence01(input.cluster_confidence, "cluster_confidence");
    return deepFreeze({
        ...input,
        candidate_ids: [...input.candidate_ids],
        similarity_scores: [...input.similarity_scores],
    });
};
//# sourceMappingURL=event-cluster.entity.js.map