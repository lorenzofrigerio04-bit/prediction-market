import { type FeedbackAggregation } from "../entities/feedback-aggregation.entity.js";
import type { FeedbackAggregator } from "../interfaces/feedback-aggregator.js";
export declare class DeterministicFeedbackAggregator implements FeedbackAggregator {
    aggregate(input: FeedbackAggregation): FeedbackAggregation;
}
//# sourceMappingURL=deterministic-feedback-aggregator.d.ts.map