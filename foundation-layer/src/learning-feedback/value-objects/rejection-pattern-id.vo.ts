import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type RejectionPatternId = Branded<string, "RejectionPatternId">;

export const createRejectionPatternId = (value: string): RejectionPatternId =>
  createPrefixedId(value, "lrp_", "RejectionPatternId") as RejectionPatternId;
