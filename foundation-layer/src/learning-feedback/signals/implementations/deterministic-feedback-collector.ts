import type { FeedbackSignal } from "../entities/feedback-signal.entity.js";
import { createFeedbackSignal } from "../entities/feedback-signal.entity.js";
import type { FeedbackCollector } from "../interfaces/feedback-collector.js";

export class DeterministicFeedbackCollector implements FeedbackCollector {
  collect(input: FeedbackSignal): FeedbackSignal {
    return createFeedbackSignal(input);
  }
}
