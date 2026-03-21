import { ValidationError } from "../common/errors/validation-error.js";
import { normalizeKey } from "../common/utils/normalization.js";
const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_TAG_LENGTH = 32;
export const createTag = (value) => {
    const normalized = normalizeKey(value).replace(/\s+/g, "-");
    if (normalized.length === 0 || normalized.length > MAX_TAG_LENGTH) {
        throw new ValidationError("INVALID_TAG_LENGTH", "Tag length is invalid", {
            value: normalized,
        });
    }
    if (!TAG_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_TAG_FORMAT", "Tag must contain lowercase alphanumerics and dashes only", { value: normalized });
    }
    return normalized;
};
//# sourceMappingURL=tag.vo.js.map