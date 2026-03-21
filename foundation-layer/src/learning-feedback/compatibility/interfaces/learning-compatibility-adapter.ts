import type { LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";

export interface LearningCompatibilityAdapter<TInput> {
  adapt(input: TInput): LearningCompatibilityResult;
}
