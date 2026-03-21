import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type RaceTargetKey = Branded<string, "RaceTargetKey">;

const RACE_TARGET_KEY_PATTERN = /^[a-z][a-z0-9_]{1,31}$/;

export const createRaceTargetKey = (value: string): RaceTargetKey => {
  if (!RACE_TARGET_KEY_PATTERN.test(value)) {
    throw new ValidationError("INVALID_RACE_TARGET_KEY", "race target key is invalid", {
      value,
    });
  }
  return value as RaceTargetKey;
};
