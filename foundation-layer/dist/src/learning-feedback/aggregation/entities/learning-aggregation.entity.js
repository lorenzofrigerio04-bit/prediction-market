import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { AggregationStatus } from "../../enums/aggregation-status.enum.js";
import { createLearningRefList } from "../../value-objects/learning-feedback-shared.vo.js";
export const createLearningAggregation = (input) => {
    if (!Object.values(AggregationStatus).includes(input.aggregation_status)) {
        throw new ValidationError("INVALID_LEARNING_AGGREGATION", "aggregation_status is invalid");
    }
    if (input.correlation_id.trim().length === 0) {
        throw new ValidationError("INVALID_LEARNING_AGGREGATION", "correlation_id is required");
    }
    const input_signal_refs = createLearningRefList(input.input_signal_refs, "input_signal_refs", 1);
    const aggregated_insight_refs = createLearningRefList(input.aggregated_insight_refs, "aggregated_insight_refs");
    return deepFreeze({
        ...input,
        input_signal_refs,
        aggregated_insight_refs,
    });
};
//# sourceMappingURL=learning-aggregation.entity.js.map