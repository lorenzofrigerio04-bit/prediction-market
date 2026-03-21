import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createNote = (value) => {
    const normalized = createNonEmpty(value, "note");
    if (normalized.length > 512) {
        throw new ValidationError("NOTE_EMPTY", "Note exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=note.vo.js.map