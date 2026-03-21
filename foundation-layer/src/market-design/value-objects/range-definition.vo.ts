import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export type RangeDefinition = Readonly<{
  min_inclusive: number;
  max_exclusive: number;
  label_nullable: string | null;
}>;

export const createRangeDefinition = (input: RangeDefinition): RangeDefinition => {
  if (!Number.isFinite(input.min_inclusive) || !Number.isFinite(input.max_exclusive)) {
    throw new ValidationError("INVALID_RANGE_DEFINITION", "range bounds must be finite numbers");
  }
  if (input.max_exclusive <= input.min_inclusive) {
    throw new ValidationError(
      "INVALID_RANGE_DEFINITION",
      "max_exclusive must be greater than min_inclusive",
      input,
    );
  }
  return deepFreeze({
    ...input,
    label_nullable: input.label_nullable === null ? null : input.label_nullable.trim(),
  });
};
