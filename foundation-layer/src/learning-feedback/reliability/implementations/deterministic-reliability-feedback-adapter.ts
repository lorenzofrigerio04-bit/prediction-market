import type { ReliabilityFeedbackAdapter } from "../interfaces/reliability-feedback-adapter.js";
import { createReliabilityFeedback, type ReliabilityFeedback } from "../entities/reliability-feedback.entity.js";

export class DeterministicReliabilityFeedbackAdapter
  implements ReliabilityFeedbackAdapter<ReliabilityFeedback>
{
  adapt(input: ReliabilityFeedback): ReliabilityFeedback {
    return createReliabilityFeedback(input);
  }
}
