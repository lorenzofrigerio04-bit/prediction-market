import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";

export type Locale = Branded<string, "Locale">;
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2}|\-[a-zA-Z0-9]{2,8})?$/;

export const createLocale = (value: string): Locale => {
  const normalized = value.trim();
  if (!LOCALE_PATTERN.test(normalized)) {
    throw new ValidationError("INVALID_LOCALE", "Locale must resemble BCP-47", {
      value,
    });
  }
  return normalized as Locale;
};
