import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type DecisionReference = Branded<string, "DecisionReference">;

export const createDecisionReference = (value: string): DecisionReference => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_DECISION_REFERENCE", "decision_reference must not be empty", { value });
  }
  return normalized as DecisionReference;
};
