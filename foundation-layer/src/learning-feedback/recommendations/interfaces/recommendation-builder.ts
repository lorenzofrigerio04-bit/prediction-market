import type { RecommendationSet } from "../entities/recommendation-set.entity.js";

export interface RecommendationBuilder {
  build(input: RecommendationSet): RecommendationSet;
}
