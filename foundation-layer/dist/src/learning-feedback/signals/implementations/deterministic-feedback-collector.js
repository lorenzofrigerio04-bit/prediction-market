import { createFeedbackSignal } from "../entities/feedback-signal.entity.js";
export class DeterministicFeedbackCollector {
    collect(input) {
        return createFeedbackSignal(input);
    }
}
//# sourceMappingURL=deterministic-feedback-collector.js.map