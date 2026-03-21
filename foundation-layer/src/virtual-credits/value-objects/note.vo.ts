import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type Note = Branded<string, "Note">;

export const createNote = (value: string): Note => {
  const normalized = createNonEmpty(value, "note");
  if (normalized.length > 512) {
    throw new ValidationError("NOTE_EMPTY", "Note exceeds max length", { length: normalized.length });
  }
  return normalized as Note;
};
