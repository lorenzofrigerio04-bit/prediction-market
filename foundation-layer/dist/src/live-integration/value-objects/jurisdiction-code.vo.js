import { ValidationError } from "../../common/errors/validation-error.js";
const JURISDICTION_PATTERN = /^[A-Z]{2,3}$/;
export const createJurisdictionCode = (value) => {
    const normalized = value.trim().toUpperCase();
    if (!JURISDICTION_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_JURISDICTION_CODE", "jurisdiction must be a 2-3 letter uppercase code", { value });
    }
    return normalized;
};
//# sourceMappingURL=jurisdiction-code.vo.js.map