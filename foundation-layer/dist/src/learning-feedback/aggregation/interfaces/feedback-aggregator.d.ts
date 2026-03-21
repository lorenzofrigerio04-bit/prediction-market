import type { FeedbackAggregation } from "../entities/feedback-aggregation.entity.js";
export interface FeedbackAggregator {
    aggregate(input: FeedbackAggregation): FeedbackAggregation;
}
//# sourceMappingURL=feedback-aggregator.d.ts.map