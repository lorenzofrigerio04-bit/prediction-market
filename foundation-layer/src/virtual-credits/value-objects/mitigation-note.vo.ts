import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";

export type MitigationNote = Branded<string, "MitigationNote">;

export const createMitigationNote = (value: string): MitigationNote => {
  const normalized = createNonEmpty(value, "mitigationNote");
  if (normalized.length > 512) {
    throw new ValidationError("MITIGATION_NOTE_EMPTY", "MitigationNote exceeds max length", { length: normalized.length });
  }
  return normalized as MitigationNote;
};
