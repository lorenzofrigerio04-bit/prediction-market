import type { Branded } from "../common/types/branded.js";
import { assertNonEmpty } from "../common/utils/normalization.js";
import { ValidationError } from "../common/errors/validation-error.js";

export type Description = Branded<string, "Description">;
const MAX_DESCRIPTION_LENGTH = 5000;

export const createDescription = (value: string): Description => {
  const normalized = assertNonEmpty(value, "description");
  if (normalized.length > MAX_DESCRIPTION_LENGTH) {
    throw new ValidationError(
      "DESCRIPTION_TOO_LONG",
      "Description exceeds max length",
      {
        maxLength: MAX_DESCRIPTION_LENGTH,
        length: normalized.length,
      },
    );
  }
  return normalized as Description;
};
