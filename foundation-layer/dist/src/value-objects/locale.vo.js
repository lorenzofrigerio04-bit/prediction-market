import { ValidationError } from "../common/errors/validation-error.js";
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2}|\-[a-zA-Z0-9]{2,8})?$/;
export const createLocale = (value) => {
    const normalized = value.trim();
    if (!LOCALE_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_LOCALE", "Locale must resemble BCP-47", {
            value,
        });
    }
    return normalized;
};
//# sourceMappingURL=locale.vo.js.map