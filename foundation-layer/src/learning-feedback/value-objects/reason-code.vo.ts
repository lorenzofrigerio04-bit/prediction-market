import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type ReasonCode = Branded<string, "ReasonCode">;

export const createReasonCode = (value: string): ReasonCode => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_REASON_CODE", "reason_code must not be empty", { value });
  }
  return normalized as ReasonCode;
};
