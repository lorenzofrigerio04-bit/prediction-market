import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";

export const createNonEmptyTrimmed = (value: string, code: string, field: string): string => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError(code, `${field} must not be empty`);
  }
  return normalized;
};

export const createUniqueTextList = (
  values: readonly string[],
  code: string,
  field: string,
  minimum = 0,
): readonly string[] => {
  const normalized = values.map((value) => createNonEmptyTrimmed(value, code, field));
  if (normalized.length < minimum) {
    throw new ValidationError(code, `${field} must contain at least ${minimum} item(s)`);
  }
  if (new Set(normalized).size !== normalized.length) {
    throw new ValidationError(code, `${field} must be unique`);
  }
  return deepFreeze([...normalized]);
};
