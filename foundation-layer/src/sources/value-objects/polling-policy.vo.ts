import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type PollingPolicy = Readonly<{
  intervalSeconds: number;
  jitterSeconds: number;
}>;

export const createPollingPolicy = (input: PollingPolicy): PollingPolicy => {
  if (!Number.isInteger(input.intervalSeconds) || input.intervalSeconds <= 0) {
    throw new ValidationError(
      "INVALID_POLLING_POLICY",
      "intervalSeconds must be a positive integer",
      { intervalSeconds: input.intervalSeconds },
    );
  }
  if (!Number.isInteger(input.jitterSeconds) || input.jitterSeconds < 0) {
    throw new ValidationError(
      "INVALID_POLLING_POLICY",
      "jitterSeconds must be a non-negative integer",
      { jitterSeconds: input.jitterSeconds },
    );
  }
  return deepFreeze({
    intervalSeconds: input.intervalSeconds,
    jitterSeconds: input.jitterSeconds,
  });
};
