import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type ExpectedInvariant = Readonly<{
  code: string;
  description: string;
  path: string;
}>;

export const createExpectedInvariant = (input: ExpectedInvariant): ExpectedInvariant => {
  if (input.code.trim().length === 0) {
    throw new ValidationError("INVALID_EXPECTED_INVARIANT", "code must not be empty");
  }
  if (input.description.trim().length === 0) {
    throw new ValidationError("INVALID_EXPECTED_INVARIANT", "description must not be empty");
  }
  if (input.path.trim().length === 0) {
    throw new ValidationError("INVALID_EXPECTED_INVARIANT", "path must not be empty");
  }
  return deepFreeze(input);
};

export const createExpectedInvariantCollection = (
  input: readonly ExpectedInvariant[],
): readonly ExpectedInvariant[] => {
  if (input.length === 0) {
    throw new ValidationError(
      "INVALID_EXPECTED_INVARIANTS",
      "GoldenDatasetEntry.expected_invariants must not be empty",
    );
  }
  return deepFreeze(input.map((item) => createExpectedInvariant(item)));
};
