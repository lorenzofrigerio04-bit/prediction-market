import { assertNonEmpty } from "../common/utils/normalization.js";
import { ValidationError } from "../common/errors/validation-error.js";
const MAX_TITLE_LENGTH = 200;
export const createTitle = (value) => {
    const normalized = assertNonEmpty(value, "title");
    if (normalized.length > MAX_TITLE_LENGTH) {
        throw new ValidationError("TITLE_TOO_LONG", "Title exceeds max length", {
            maxLength: MAX_TITLE_LENGTH,
            length: normalized.length,
        });
    }
    return normalized;
};
//# sourceMappingURL=title.vo.js.map