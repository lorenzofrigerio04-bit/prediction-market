import { ValidationError } from "../../common/errors/validation-error.js";
export const createNotes = (value) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
        throw new ValidationError("INVALID_NOTES", "notes must not be empty", { value });
    }
    return normalized;
};
//# sourceMappingURL=notes.vo.js.map