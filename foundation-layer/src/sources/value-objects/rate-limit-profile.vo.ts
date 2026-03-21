import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type RateLimitProfile = Readonly<{
  maxRequests: number;
  perSeconds: number;
}>;

export const createRateLimitProfile = (input: RateLimitProfile): RateLimitProfile => {
  if (!Number.isInteger(input.maxRequests) || input.maxRequests <= 0) {
    throw new ValidationError(
      "INVALID_RATE_LIMIT_PROFILE",
      "maxRequests must be a positive integer",
      { maxRequests: input.maxRequests },
    );
  }
  if (!Number.isInteger(input.perSeconds) || input.perSeconds <= 0) {
    throw new ValidationError(
      "INVALID_RATE_LIMIT_PROFILE",
      "perSeconds must be a positive integer",
      { perSeconds: input.perSeconds },
    );
  }
  return deepFreeze({
    maxRequests: input.maxRequests,
    perSeconds: input.perSeconds,
  });
};
