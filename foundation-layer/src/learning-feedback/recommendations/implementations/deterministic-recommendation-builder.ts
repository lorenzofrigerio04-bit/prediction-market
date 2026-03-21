import { createRecommendationSet, type RecommendationSet } from "../entities/recommendation-set.entity.js";
import type { RecommendationBuilder } from "../interfaces/recommendation-builder.js";

export class DeterministicRecommendationBuilder implements RecommendationBuilder {
  build(input: RecommendationSet): RecommendationSet {
    return createRecommendationSet(input);
  }
}
