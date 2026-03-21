import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type AffectedModuleReference = Branded<string, "AffectedModuleReference">;

export const createAffectedModuleReference = (value: string): AffectedModuleReference => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_AFFECTED_MODULE_REFERENCE", "affected_module_reference must not be empty", { value });
  }
  return normalized as AffectedModuleReference;
};
