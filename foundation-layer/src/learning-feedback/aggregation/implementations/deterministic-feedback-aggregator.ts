import { createFeedbackAggregation, type FeedbackAggregation } from "../entities/feedback-aggregation.entity.js";
import type { FeedbackAggregator } from "../interfaces/feedback-aggregator.js";

export class DeterministicFeedbackAggregator implements FeedbackAggregator {
  aggregate(input: FeedbackAggregation): FeedbackAggregation {
    return createFeedbackAggregation(input);
  }
}
