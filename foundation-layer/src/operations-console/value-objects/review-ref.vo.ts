import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type ReviewRef = Branded<string, "ReviewRef">;

export const createReviewRef = (value: string): ReviewRef =>
  createPrefixedId(value, "rev_", "ReviewRef") as ReviewRef;
