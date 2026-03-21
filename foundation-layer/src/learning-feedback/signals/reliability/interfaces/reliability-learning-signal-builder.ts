import type { ReliabilityLearningSignal } from "../entities/reliability-learning-signal.entity.js";

export interface ReliabilityLearningSignalBuilder {
  build(input: ReliabilityLearningSignal): ReliabilityLearningSignal;
}
