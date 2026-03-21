import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type FeedbackAggregationId = Branded<string, "FeedbackAggregationId">;

export const createFeedbackAggregationId = (value: string): FeedbackAggregationId =>
  createPrefixedId(value, "lfa_", "FeedbackAggregationId") as FeedbackAggregationId;
