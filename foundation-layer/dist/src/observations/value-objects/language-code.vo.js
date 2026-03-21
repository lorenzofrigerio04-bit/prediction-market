import { ValidationError } from "../../common/errors/validation-error.js";
const LANGUAGE_CODE_PATTERN = /^[a-z]{2,3}(?:-[A-Z]{2}|-[a-zA-Z0-9]{2,8})?$/;
export const createLanguageCode = (value) => {
    if (!LANGUAGE_CODE_PATTERN.test(value)) {
        throw new ValidationError("INVALID_LANGUAGE_CODE", "LanguageCode must follow BCP-47 subset", {
            value,
        });
    }
    return value;
};
//# sourceMappingURL=language-code.vo.js.map