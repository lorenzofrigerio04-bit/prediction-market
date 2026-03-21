import { ValidationError } from "../../common/errors/validation-error.js";

export type DeadlineBasisReference = string & { readonly __brand: "DeadlineBasisReference" };

export const createDeadlineBasisReference = (value: string): DeadlineBasisReference => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError(
      "INVALID_DEADLINE_BASIS_REFERENCE",
      "deadline_basis_reference must be non-empty",
    );
  }
  return normalized as DeadlineBasisReference;
};
