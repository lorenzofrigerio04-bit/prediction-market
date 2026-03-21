import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type AggregationWindow = Branded<number, "AggregationWindow">;

export const createAggregationWindow = (value: number): AggregationWindow => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError("INVALID_AGGREGATION_WINDOW", "aggregation_window must be an integer > 0", { value });
  }
  return value as AggregationWindow;
};
