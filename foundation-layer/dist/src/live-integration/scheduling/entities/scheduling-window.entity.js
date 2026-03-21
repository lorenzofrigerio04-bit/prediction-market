import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { createTimestamp } from "../../../value-objects/timestamp.vo.js";
export const createSchedulingWindow = (input) => {
    const startAt = createTimestamp(input.start_at);
    const endAt = createTimestamp(input.end_at);
    if (Date.parse(startAt) >= Date.parse(endAt)) {
        throw new ValidationError("INVALID_SCHEDULING_WINDOW", "start_at must be earlier than end_at");
    }
    return deepFreeze({
        start_at: startAt,
        end_at: endAt,
    });
};
//# sourceMappingURL=scheduling-window.entity.js.map