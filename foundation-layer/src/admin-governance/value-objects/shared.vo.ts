import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty } from "../../common/utils/normalization.js";

export const createNonEmpty = (value: string, field: string): string =>
  assertNonEmpty(value, field);

export const createPositiveFinite = (value: number, field: string): number => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError("INVALID_NUMBER", `${field} must be a finite number > 0`, { field, value });
  }
  return value;
};
