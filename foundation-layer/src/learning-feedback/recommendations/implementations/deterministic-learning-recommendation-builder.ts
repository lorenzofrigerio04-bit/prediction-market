import {
  createLearningRecommendation,
  type LearningRecommendation,
} from "../entities/learning-recommendation.entity.js";
import type { LearningRecommendationBuilder } from "../interfaces/learning-recommendation-builder.js";

export class DeterministicLearningRecommendationBuilder
  implements LearningRecommendationBuilder
{
  build(input: LearningRecommendation): LearningRecommendation {
    return createLearningRecommendation(input);
  }
}
