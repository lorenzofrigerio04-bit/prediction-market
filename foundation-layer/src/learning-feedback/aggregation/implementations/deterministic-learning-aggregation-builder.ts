import {
  createLearningAggregation,
  type LearningAggregation,
} from "../entities/learning-aggregation.entity.js";
import type { LearningAggregationBuilder } from "../interfaces/learning-aggregation-builder.js";

export class DeterministicLearningAggregationBuilder implements LearningAggregationBuilder {
  build(input: LearningAggregation): LearningAggregation {
    return createLearningAggregation(input);
  }
}
