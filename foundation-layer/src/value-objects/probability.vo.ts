import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";

export type Probability = Branded<number, "Probability">;

export const createProbability = (value: number): Probability => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError("INVALID_PROBABILITY", "Probability must be within [0,1]", {
      value,
    });
  }
  return value as Probability;
};
