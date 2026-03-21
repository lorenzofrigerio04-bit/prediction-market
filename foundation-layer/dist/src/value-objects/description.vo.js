import { assertNonEmpty } from "../common/utils/normalization.js";
import { ValidationError } from "../common/errors/validation-error.js";
const MAX_DESCRIPTION_LENGTH = 5000;
export const createDescription = (value) => {
    const normalized = assertNonEmpty(value, "description");
    if (normalized.length > MAX_DESCRIPTION_LENGTH) {
        throw new ValidationError("DESCRIPTION_TOO_LONG", "Description exceeds max length", {
            maxLength: MAX_DESCRIPTION_LENGTH,
            length: normalized.length,
        });
    }
    return normalized;
};
//# sourceMappingURL=description.vo.js.map