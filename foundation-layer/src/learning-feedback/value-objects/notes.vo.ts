import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type Notes = Branded<string, "Notes">;

export const createNotes = (value: string): Notes => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_NOTES", "notes must not be empty", { value });
  }
  return normalized as Notes;
};
