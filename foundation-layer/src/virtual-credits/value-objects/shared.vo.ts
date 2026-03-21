import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export const createNonEmpty = (value: string, field: string): string =>
  assertNonEmpty(value, field);

export const createFiniteNumber = (
  value: number,
  field: string,
  options?: Readonly<{ allowZero?: boolean; allowNegative?: boolean }>,
): number => {
  if (!Number.isFinite(value)) {
    throw new ValidationError("INVALID_NUMBER", `${field} must be a finite number`, { field, value });
  }
  if (!options?.allowZero && value === 0) {
    throw new ValidationError("INVALID_NUMBER_ZERO", `${field} must not be zero`, { field, value });
  }
  if (!options?.allowNegative && value < 0) {
    throw new ValidationError("INVALID_NUMBER_NEGATIVE", `${field} must be >= 0`, { field, value });
  }
  return value;
};
