import { createReliabilityFeedback } from "../entities/reliability-feedback.entity.js";
export class DeterministicReliabilityFeedbackAdapter {
    adapt(input) {
        return createReliabilityFeedback(input);
    }
}
//# sourceMappingURL=deterministic-reliability-feedback-adapter.js.map