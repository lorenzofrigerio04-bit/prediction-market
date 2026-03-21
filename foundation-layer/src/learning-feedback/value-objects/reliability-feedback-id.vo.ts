import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type ReliabilityFeedbackId = Branded<string, "ReliabilityFeedbackId">;

export const createReliabilityFeedbackId = (value: string): ReliabilityFeedbackId =>
  createPrefixedId(value, "lrf_", "ReliabilityFeedbackId") as ReliabilityFeedbackId;
