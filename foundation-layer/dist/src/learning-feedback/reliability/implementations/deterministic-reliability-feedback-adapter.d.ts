import type { ReliabilityFeedbackAdapter } from "../interfaces/reliability-feedback-adapter.js";
import { type ReliabilityFeedback } from "../entities/reliability-feedback.entity.js";
export declare class DeterministicReliabilityFeedbackAdapter implements ReliabilityFeedbackAdapter<ReliabilityFeedback> {
    adapt(input: ReliabilityFeedback): ReliabilityFeedback;
}
//# sourceMappingURL=deterministic-reliability-feedback-adapter.d.ts.map