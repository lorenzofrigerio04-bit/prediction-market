import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";
import { normalizeKey } from "../common/utils/normalization.js";

export type Tag = Branded<string, "Tag">;
const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TAG_LENGTH = 32;

export const createTag = (value: string): Tag => {
  const normalized = normalizeKey(value).replace(/\s+/g, "-");
  if (normalized.length === 0 || normalized.length > MAX_TAG_LENGTH) {
    throw new ValidationError("INVALID_TAG_LENGTH", "Tag length is invalid", {
      value: normalized,
    });
  }
  if (!TAG_PATTERN.test(normalized)) {
    throw new ValidationError(
      "INVALID_TAG_FORMAT",
      "Tag must contain lowercase alphanumerics and dashes only",
      { value: normalized },
    );
  }
  return normalized as Tag;
};
