import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty, normalizeKey, normalizeWhitespace } from "../../common/utils/normalization.js";
import { createScore0100 } from "../../market-design/value-objects/score.vo.js";
import { createConfidenceScore } from "../../value-objects/confidence-score.vo.js";
const hasInvalidPrimitive = (value) => {
    if (value === null) {
        return false;
    }
    if (typeof value === "string" || typeof value === "boolean") {
        return false;
    }
    if (typeof value === "number") {
        return !Number.isFinite(value);
    }
    if (Array.isArray(value)) {
        return value.some(hasInvalidPrimitive);
    }
    if (typeof value === "object") {
        return Object.values(value).some(hasInvalidPrimitive);
    }
    return true;
};
export const createDeterministicMetadata = (value, field) => {
    if (hasInvalidPrimitive(value)) {
        throw new ValidationError("INVALID_DETERMINISTIC_METADATA", `${field} must be JSON-serializable`, {
            field,
        });
    }
    return Object.freeze({ ...value });
};
const validateIssue = (value, field) => Object.freeze({
    code: assertNonEmpty(value.code, `${field}.code`),
    message: assertNonEmpty(value.message, `${field}.message`),
    path: assertNonEmpty(value.path, `${field}.path`),
});
export const createIssueCollection = (values, field) => {
    const normalized = values.map((value, index) => validateIssue(value, `${field}[${index}]`));
    const keys = normalized.map((value) => `${normalizeKey(value.code)}|${normalizeKey(value.path)}`);
    if (new Set(keys).size !== keys.length) {
        throw new ValidationError("DUPLICATE_PUBLISHING_ISSUE", `${field} must not contain duplicates`, {
            field,
        });
    }
    return Object.freeze([...normalized]);
};
export const createSummaryConfidence = (value) => createConfidenceScore(value);
export const createStructuralReadinessScore = (value) => createScore0100(value, "score");
export const createTextBlock = (value, field) => assertNonEmpty(normalizeWhitespace(value), field);
export const createDeterministicToken = (seed) => {
    const normalized = normalizeWhitespace(seed).toLowerCase();
    let acc = 0;
    for (let index = 0; index < normalized.length; index += 1) {
        acc = (acc * 31 + normalized.charCodeAt(index)) % 1_000_000;
    }
    return acc.toString().padStart(6, "0");
};
//# sourceMappingURL=publishing-shared.vo.js.map