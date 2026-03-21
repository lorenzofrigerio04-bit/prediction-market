import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
import { RecencyPriority } from "../enums/recency-priority.enum.js";

export type FreshnessProfile = Readonly<{
  expectedUpdateFrequency: string;
  freshnessTtl: number;
  recencyPriority: RecencyPriority;
}>;

export const createFreshnessProfile = (input: FreshnessProfile): FreshnessProfile => {
  const expectedUpdateFrequency = input.expectedUpdateFrequency.trim();
  if (expectedUpdateFrequency.length === 0) {
    throw new ValidationError(
      "INVALID_EXPECTED_UPDATE_FREQUENCY",
      "expectedUpdateFrequency must be non-empty",
    );
  }
  if (!Number.isInteger(input.freshnessTtl) || input.freshnessTtl < 0) {
    throw new ValidationError(
      "INVALID_FRESHNESS_TTL",
      "freshnessTtl must be a non-negative integer (seconds)",
      { freshnessTtl: input.freshnessTtl },
    );
  }

  return deepFreeze({
    expectedUpdateFrequency,
    freshnessTtl: input.freshnessTtl,
    recencyPriority: input.recencyPriority,
  });
};
