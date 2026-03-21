import type { LearningInsight } from "../entities/learning-insight.entity.js";

export interface InsightGenerator {
  generate(input: LearningInsight): LearningInsight;
}
