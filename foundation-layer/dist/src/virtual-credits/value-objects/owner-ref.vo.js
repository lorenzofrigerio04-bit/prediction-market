import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createOwnerRef = (value) => {
    const normalized = createNonEmpty(value, "ownerRef");
    if (normalized.length > 512) {
        throw new ValidationError("OWNER_REF_EMPTY", "OwnerRef exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=owner-ref.vo.js.map