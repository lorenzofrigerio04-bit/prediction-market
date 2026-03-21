import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type ObservationConfidenceScore = Branded<number, "ObservationConfidenceScore">;

export const createObservationConfidenceScore = (value: number): ObservationConfidenceScore => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError(
      "INVALID_OBSERVATION_CONFIDENCE_SCORE",
      "ObservationConfidenceScore must be within [0,1]",
      { value },
    );
  }
  return value as ObservationConfidenceScore;
};
