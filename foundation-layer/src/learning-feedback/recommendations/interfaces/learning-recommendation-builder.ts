import type { LearningRecommendation } from "../entities/learning-recommendation.entity.js";

export interface LearningRecommendationBuilder {
  build(input: LearningRecommendation): LearningRecommendation;
}
