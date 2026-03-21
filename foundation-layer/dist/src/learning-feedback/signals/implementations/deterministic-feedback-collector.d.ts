import type { FeedbackSignal } from "../entities/feedback-signal.entity.js";
import type { FeedbackCollector } from "../interfaces/feedback-collector.js";
export declare class DeterministicFeedbackCollector implements FeedbackCollector {
    collect(input: FeedbackSignal): FeedbackSignal;
}
//# sourceMappingURL=deterministic-feedback-collector.d.ts.map