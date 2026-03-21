import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type SourceEntityReference = Branded<string, "SourceEntityReference">;

export const createSourceEntityReference = (value: string): SourceEntityReference => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_SOURCE_ENTITY_REFERENCE", "source_entity_reference must not be empty", { value });
  }
  return normalized as SourceEntityReference;
};
