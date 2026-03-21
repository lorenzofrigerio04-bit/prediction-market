import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type OverridePatternId = Branded<string, "OverridePatternId">;

export const createOverridePatternId = (value: string): OverridePatternId =>
  createPrefixedId(value, "lop_", "OverridePatternId") as OverridePatternId;
