import { createLearningInsight, type LearningInsight } from "../entities/learning-insight.entity.js";
import type { InsightGenerator } from "../interfaces/insight-generator.js";

export class DeterministicInsightGenerator implements InsightGenerator {
  generate(input: LearningInsight): LearningInsight {
    return createLearningInsight(input);
  }
}
