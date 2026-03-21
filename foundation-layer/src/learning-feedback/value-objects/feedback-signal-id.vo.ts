import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type FeedbackSignalId = Branded<string, "FeedbackSignalId">;

export const createFeedbackSignalId = (value: string): FeedbackSignalId =>
  createPrefixedId(value, "lfg_", "FeedbackSignalId") as FeedbackSignalId;
