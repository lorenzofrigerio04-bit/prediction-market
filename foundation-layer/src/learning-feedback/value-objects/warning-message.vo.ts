import type { Branded } from "../../common/types/branded.js";
import { ValidationError } from "../../common/errors/validation-error.js";

export type WarningMessage = Branded<string, "WarningMessage">;

export const createWarningMessage = (value: string): WarningMessage => {
  const normalized = value.trim();
  if (normalized.length === 0) {
    throw new ValidationError("INVALID_WARNING_MESSAGE", "warning_message must not be empty", { value });
  }
  return normalized as WarningMessage;
};
