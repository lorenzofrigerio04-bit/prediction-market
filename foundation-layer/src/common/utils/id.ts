import { ValidationError } from "../errors/validation-error.js";
import type { Branded } from "../types/branded.js";

const ID_BODY_PATTERN = "[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}";

export const createPrefixedId = <TBrand extends string>(
  value: string,
  prefix: string,
  brand: TBrand,
): Branded<string, TBrand> => {
  const pattern = new RegExp(`^${prefix}${ID_BODY_PATTERN}$`);
  if (!pattern.test(value)) {
    throw new ValidationError("INVALID_ID", `Invalid ${brand} format`, {
      expectedPrefix: prefix,
      value,
    });
  }
  return value as Branded<string, TBrand>;
};
