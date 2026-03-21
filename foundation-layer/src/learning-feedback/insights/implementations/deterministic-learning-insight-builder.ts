import { createLearningInsight, type LearningInsight } from "../entities/learning-insight.entity.js";
import type { LearningInsightBuilder } from "../interfaces/learning-insight-builder.js";

export class DeterministicLearningInsightBuilder implements LearningInsightBuilder {
  build(input: LearningInsight): LearningInsight {
    return createLearningInsight(input);
  }
}
