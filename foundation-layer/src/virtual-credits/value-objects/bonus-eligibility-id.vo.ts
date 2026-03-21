import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type BonusEligibilityId = Branded<string, "BonusEligibilityId">;

export const createBonusEligibilityId = (value: string): BonusEligibilityId =>
  createPrefixedId(value, "vbe_", "BonusEligibilityId");
