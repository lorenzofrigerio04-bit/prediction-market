import { ValidationError } from "../errors/validation-error.js";
export const normalizeWhitespace = (value) => value.trim().replace(/\s+/g, " ");
export const normalizeKey = (value) => normalizeWhitespace(value).toLowerCase();
export const assertNonEmpty = (value, fieldName) => {
    const normalized = normalizeWhitespace(value);
    if (normalized.length === 0) {
        throw new ValidationError("EMPTY_STRING", `${fieldName} must be a non-empty string`, { fieldName });
    }
    return normalized;
};
export const slugify = (input) => {
    const normalized = normalizeWhitespace(input)
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .toLowerCase()
        .replace(/_/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_SLUG", "Slug value cannot be empty after normalization", { input });
    }
    return normalized;
};
export const uniqueNormalized = (values) => {
    const seen = new Set();
    const output = [];
    for (const value of values) {
        const key = normalizeKey(value);
        if (!seen.has(key)) {
            seen.add(key);
            output.push(value);
        }
    }
    return output;
};
//# sourceMappingURL=normalization.js.map