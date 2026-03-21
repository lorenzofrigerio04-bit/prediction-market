import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type RecommendationSetId = Branded<string, "RecommendationSetId">;

export const createRecommendationSetId = (value: string): RecommendationSetId =>
  createPrefixedId(value, "lrc_", "RecommendationSetId") as RecommendationSetId;
