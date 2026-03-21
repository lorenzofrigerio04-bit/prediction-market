import { ValidationError } from "../common/errors/validation-error.js";

export type EntityVersion = number & { readonly __brand: "EntityVersion" };

export const createEntityVersion = (value: number = 1): EntityVersion => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(
      "INVALID_ENTITY_VERSION",
      "EntityVersion must be a positive integer",
      { value },
    );
  }
  return value as EntityVersion;
};
