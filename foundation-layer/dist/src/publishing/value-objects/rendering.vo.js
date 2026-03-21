import { ValidationError } from "../../common/errors/validation-error.js";
import { assertNonEmpty, normalizeKey, normalizeWhitespace } from "../../common/utils/normalization.js";
export const createOrderedRenderItems = (values, field) => {
    const normalized = values.map((value, index) => assertNonEmpty(normalizeWhitespace(value), `${field}[${index}]`));
    const unique = new Set(normalized.map(normalizeKey));
    if (unique.size !== normalized.length) {
        throw new ValidationError("DUPLICATE_RENDER_ITEMS", `${field} contains duplicate items`, { field });
    }
    return Object.freeze([...normalized]);
};
//# sourceMappingURL=rendering.vo.js.map