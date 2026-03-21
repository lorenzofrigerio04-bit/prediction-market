import type { FeedbackSignal } from "../entities/feedback-signal.entity.js";
export interface FeedbackCollector<TInput = FeedbackSignal> {
    collect(input: TInput): FeedbackSignal;
}
//# sourceMappingURL=feedback-collector.d.ts.map