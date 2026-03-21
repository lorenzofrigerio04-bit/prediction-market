import type { LearningInsight } from "../entities/learning-insight.entity.js";

export interface LearningInsightBuilder {
  build(input: LearningInsight): LearningInsight;
}
