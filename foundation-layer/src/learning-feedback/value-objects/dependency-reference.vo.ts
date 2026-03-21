import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type DependencyReference = Branded<string, "DependencyReference">;

export const createDependencyReference = (value: string): DependencyReference => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_DEPENDENCY_REFERENCE", "dependency_reference must not be empty", { value });
  }
  return normalized as DependencyReference;
};
