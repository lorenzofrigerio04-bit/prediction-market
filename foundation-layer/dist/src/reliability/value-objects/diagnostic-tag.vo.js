import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiagnosticTag = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_DIAGNOSTIC_TAG", "DiagnosticTag must not be empty");
    }
    return normalized;
};
export const createDiagnosticTagCollection = (input) => deepFreeze(input.map((item) => createDiagnosticTag(item)));
//# sourceMappingURL=diagnostic-tag.vo.js.map