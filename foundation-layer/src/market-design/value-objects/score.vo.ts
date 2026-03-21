import { ValidationError } from "../../common/errors/validation-error.js";

export type Score01 = number & { readonly __brand: "Score01" };
export type Score0100 = number & { readonly __brand: "Score0100" };

export const createScore01 = (value: number, field: string): Score01 => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new ValidationError("INVALID_SCORE_RANGE", `${field} must be within [0,1]`, {
      field,
      value,
    });
  }
  return value as Score01;
};

export const createScore0100 = (value: number, field: string): Score0100 => {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new ValidationError("INVALID_SCORE_RANGE", `${field} must be within [0,100]`, {
      field,
      value,
    });
  }
  return value as Score0100;
};
