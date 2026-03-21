import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type OutcomeKey = Branded<string, "OutcomeKey">;

const OUTCOME_KEY_PATTERN = /^[a-z0-9][a-z0-9_:-]{1,62}$/;

export const createOutcomeKey = (value: string): OutcomeKey => {
  if (!OUTCOME_KEY_PATTERN.test(value)) {
    throw new ValidationError(
      "INVALID_OUTCOME_KEY",
      "outcome_key must match /^[a-z0-9][a-z0-9_:-]{1,62}$/",
      { value },
    );
  }
  return value as OutcomeKey;
};
