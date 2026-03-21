import type { LearningAggregation } from "../entities/learning-aggregation.entity.js";

export interface LearningAggregationBuilder {
  build(input: LearningAggregation): LearningAggregation;
}
