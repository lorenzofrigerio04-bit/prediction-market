import {
  createReliabilityLearningSignal,
  type ReliabilityLearningSignal,
} from "../entities/reliability-learning-signal.entity.js";
import type { ReliabilityLearningSignalBuilder } from "../interfaces/reliability-learning-signal-builder.js";

export class DeterministicReliabilityLearningSignalBuilder
  implements ReliabilityLearningSignalBuilder
{
  build(input: ReliabilityLearningSignal): ReliabilityLearningSignal {
    return createReliabilityLearningSignal(input);
  }
}
