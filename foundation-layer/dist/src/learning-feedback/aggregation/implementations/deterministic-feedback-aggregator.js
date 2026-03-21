import { createFeedbackAggregation } from "../entities/feedback-aggregation.entity.js";
export class DeterministicFeedbackAggregator {
    aggregate(input) {
        return createFeedbackAggregation(input);
    }
}
//# sourceMappingURL=deterministic-feedback-aggregator.js.map