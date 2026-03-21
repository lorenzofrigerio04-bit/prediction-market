import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type AdjustmentReason = Branded<string, "AdjustmentReason">;

export const createAdjustmentReason = (value: string): AdjustmentReason => {
  const normalized = createNonEmpty(value, "adjustmentReason");
  if (normalized.length > 512) {
    throw new ValidationError("ADJUSTMENT_REASON_EMPTY", "AdjustmentReason exceeds max length", { length: normalized.length });
  }
  return normalized as AdjustmentReason;
};
