import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type LearningInsightId = Branded<string, "LearningInsightId">;

export const createLearningInsightId = (value: string): LearningInsightId =>
  createPrefixedId(value, "lin_", "LearningInsightId") as LearningInsightId;
