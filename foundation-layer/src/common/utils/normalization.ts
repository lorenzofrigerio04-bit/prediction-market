import { ValidationError } from "../errors/validation-error.js";

export const normalizeWhitespace = (value: string): string =>
  value.trim().replace(/\s+/g, " ");

export const normalizeKey = (value: string): string =>
  normalizeWhitespace(value).toLowerCase();

export const assertNonEmpty = (value: string, fieldName: string): string => {
  const normalized = normalizeWhitespace(value);
  if (normalized.length === 0) {
    throw new ValidationError(
      "EMPTY_STRING",
      `${fieldName} must be a non-empty string`,
      { fieldName },
    );
  }
  return normalized;
};

export const slugify = (input: string): string => {
  const normalized = normalizeWhitespace(input)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (normalized.length === 0) {
    throw new ValidationError(
      "INVALID_SLUG",
      "Slug value cannot be empty after normalization",
      { input },
    );
  }

  return normalized;
};

export const uniqueNormalized = (values: readonly string[]): readonly string[] => {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const key = normalizeKey(value);
    if (!seen.has(key)) {
      seen.add(key);
      output.push(value);
    }
  }
  return output;
};
