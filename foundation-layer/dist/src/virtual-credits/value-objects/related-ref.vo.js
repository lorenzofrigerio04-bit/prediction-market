import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createRelatedRef = (value) => {
    const normalized = createNonEmpty(value, "relatedRef");
    if (normalized.length > 512) {
        throw new ValidationError("RELATED_REF_EMPTY", "RelatedRef exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=related-ref.vo.js.map