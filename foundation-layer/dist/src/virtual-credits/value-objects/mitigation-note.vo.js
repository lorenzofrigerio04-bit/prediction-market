import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createMitigationNote = (value) => {
    const normalized = createNonEmpty(value, "mitigationNote");
    if (normalized.length > 512) {
        throw new ValidationError("MITIGATION_NOTE_EMPTY", "MitigationNote exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=mitigation-note.vo.js.map