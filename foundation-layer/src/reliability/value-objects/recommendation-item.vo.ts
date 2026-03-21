import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type RecommendationItem = Branded<string, "RecommendationItem">;

export const createRecommendationItem = (value: string): RecommendationItem => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_RECOMMENDATION_ITEM", "RecommendationItem must not be empty");
  }
  return normalized as RecommendationItem;
};

export const createRecommendationItemCollection = (
  input: readonly string[],
): readonly RecommendationItem[] => deepFreeze(input.map((item) => createRecommendationItem(item)));
