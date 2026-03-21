import { ValidationError } from "../../common/errors/validation-error.js";
const assertNonEmptyTrimmed = (value, code, field) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new ValidationError(code, `${field} must be non-empty`);
    }
    return trimmed;
};
export const createDisplayLabel = (value) => assertNonEmptyTrimmed(value, "INVALID_DISPLAY_LABEL", "display_label");
export const createSemanticDefinition = (value) => assertNonEmptyTrimmed(value, "INVALID_SEMANTIC_DEFINITION", "semantic_definition");
export const createValidationNote = (value) => assertNonEmptyTrimmed(value, "INVALID_VALIDATION_NOTE", "validation_note");
export const createCompatibilityNote = (value) => assertNonEmptyTrimmed(value, "INVALID_COMPATIBILITY_NOTE", "compatibility_note");
export const createTriggerPolicyNote = (value) => assertNonEmptyTrimmed(value, "INVALID_TRIGGER_POLICY_NOTE", "trigger_policy_note");
//# sourceMappingURL=frontier-text.vo.js.map