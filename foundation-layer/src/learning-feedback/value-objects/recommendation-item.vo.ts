import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type RecommendationItem = Branded<string, "RecommendationItem">;

export const createRecommendationItem = (value: string): RecommendationItem => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_RECOMMENDATION_ITEM", "recommendation_item must not be empty", { value });
  }
  return normalized as RecommendationItem;
};
