import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type PassRate = Branded<number, "PassRate">;

export const createPassRate = (value: number): PassRate => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError("INVALID_PASS_RATE", "PassRate must be between 0 and 1");
  }
  return value as PassRate;
};
