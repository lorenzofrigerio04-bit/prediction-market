import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
export type Threshold = Branded<number, "Threshold">;
export const createThreshold = (value: number): Threshold => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError("INVALID_THRESHOLD", "threshold must be in [0,1]", { value });
  }
  return value as Threshold;
};
