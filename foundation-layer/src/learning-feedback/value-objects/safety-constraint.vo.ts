import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type SafetyConstraint = Branded<string, "SafetyConstraint">;

export const createSafetyConstraint = (value: string): SafetyConstraint => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_SAFETY_CONSTRAINT", "safety_constraint must not be empty", { value });
  }
  return normalized as SafetyConstraint;
};
