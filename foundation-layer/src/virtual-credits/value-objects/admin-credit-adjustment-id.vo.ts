import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type AdminCreditAdjustmentId = Branded<string, "AdminCreditAdjustmentId">;

export const createAdminCreditAdjustmentId = (value: string): AdminCreditAdjustmentId =>
  createPrefixedId(value, "vaa_", "AdminCreditAdjustmentId");
