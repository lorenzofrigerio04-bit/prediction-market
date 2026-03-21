import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createTraceReference = (input) => {
    if (input.trace_id.trim().length === 0) {
        throw new ValidationError("INVALID_TRACE_REFERENCE", "trace_id must not be empty");
    }
    return deepFreeze(input);
};
export const createTraceReferenceCollection = (input) => deepFreeze(input.map((item) => createTraceReference(item)));
//# sourceMappingURL=trace-reference.vo.js.map