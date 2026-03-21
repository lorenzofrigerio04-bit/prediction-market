import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type FailureSignature = Branded<string, "FailureSignature">;

export const createFailureSignature = (value: string): FailureSignature => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_FAILURE_SIGNATURE", "failure_signature must not be empty", { value });
  }
  return normalized as FailureSignature;
};
