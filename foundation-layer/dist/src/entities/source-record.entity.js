import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
import { normalizeKey } from "../common/utils/normalization.js";
export const createSourceRecord = (input) => {
    if (Number.isNaN(Date.parse(input.capturedAt))) {
        throw new ValidationError("INVALID_TIMESTAMP", "capturedAt must be a valid timestamp");
    }
    const sourceName = input.sourceName.trim();
    if (sourceName.length === 0) {
        throw new ValidationError("INVALID_SOURCE_NAME", "sourceName must be non-empty");
    }
    if (input.publishedAt !== null) {
        if (Number.isNaN(Date.parse(input.publishedAt))) {
            throw new ValidationError("INVALID_TIMESTAMP", "publishedAt must be a valid timestamp");
        }
        const publishedAtTime = Date.parse(input.publishedAt);
        const capturedAtTime = Date.parse(input.capturedAt);
        const maxFutureMs = 24 * 60 * 60 * 1000;
        if (publishedAtTime - capturedAtTime > maxFutureMs) {
            throw new ValidationError("PUBLISHED_AFTER_CAPTURED_EXCESSIVE", "publishedAt cannot exceed capturedAt by more than 24h");
        }
    }
    if (input.url !== null && !/^https?:\/\//.test(input.url)) {
        throw new ValidationError("INVALID_URL", "url must use http/https protocol");
    }
    const seenTags = new Set();
    for (const tag of input.tags) {
        const key = normalizeKey(tag);
        if (seenTags.has(key)) {
            throw new ValidationError("DUPLICATE_TAG", "tags must be unique after normalization", {
                tag,
            });
        }
        seenTags.add(key);
    }
    return deepFreeze({
        ...input,
        sourceName,
    });
};
//# sourceMappingURL=source-record.entity.js.map