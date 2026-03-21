import type { Branded } from "../common/types/branded.js";
import { ValidationError } from "../common/errors/validation-error.js";
import { slugify } from "../common/utils/normalization.js";

export type Slug = Branded<string, "Slug">;
const MAX_SLUG_LENGTH = 240;

export const createSlug = (value: string): Slug => {
  const normalized = slugify(value);
  if (normalized.length > MAX_SLUG_LENGTH) {
    throw new ValidationError("SLUG_TOO_LONG", "Slug exceeds max length", {
      maxLength: MAX_SLUG_LENGTH,
      length: normalized.length,
    });
  }
  return normalized as Slug;
};
