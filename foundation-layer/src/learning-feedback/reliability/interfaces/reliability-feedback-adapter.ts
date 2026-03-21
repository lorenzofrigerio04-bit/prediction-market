import type { ReliabilityFeedback } from "../entities/reliability-feedback.entity.js";

export interface ReliabilityFeedbackAdapter<TInput = ReliabilityFeedback> {
  adapt(input: TInput): ReliabilityFeedback;
}
