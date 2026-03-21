import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type UsageCounterId = Branded<string, "UsageCounterId">;

export const createUsageCounterId = (value: string): UsageCounterId =>
  createPrefixedId(value, "vuc_", "UsageCounterId");
