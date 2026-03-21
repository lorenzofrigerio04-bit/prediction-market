import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type SequenceTargetKey = Branded<string, "SequenceTargetKey">;

const SEQUENCE_TARGET_KEY_PATTERN = /^[a-z][a-z0-9_]{1,31}$/;

export const createSequenceTargetKey = (value: string): SequenceTargetKey => {
  if (!SEQUENCE_TARGET_KEY_PATTERN.test(value)) {
    throw new ValidationError("INVALID_SEQUENCE_TARGET_KEY", "sequence target key is invalid", {
      value,
    });
  }
  return value as SequenceTargetKey;
};
