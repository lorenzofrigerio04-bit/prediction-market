import { ValidationError } from "../common/errors/validation-error.js";
import { deepFreeze } from "../common/utils/deep-freeze.js";
const parseAsDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ValidationError("INVALID_TIMESTAMP", "Invalid timestamp", { value });
    }
    return date;
};
export const createTimestamp = (value) => {
    const asDate = typeof value === "string" ? parseAsDate(value) : value;
    if (Number.isNaN(asDate.getTime())) {
        throw new ValidationError("INVALID_TIMESTAMP", "Invalid timestamp", { value });
    }
    return asDate.toISOString();
};
export const createDateRange = (start, end) => {
    const startTs = createTimestamp(start);
    const endTs = createTimestamp(end);
    if (Date.parse(startTs) > Date.parse(endTs)) {
        throw new ValidationError("INVALID_DATE_RANGE", "DateRange start must be <= end", {
            start: startTs,
            end: endTs,
        });
    }
    return deepFreeze({ start: startTs, end: endTs });
};
export const createResolutionWindow = (openAt, closeAt) => {
    const open = createTimestamp(openAt);
    const close = createTimestamp(closeAt);
    if (Date.parse(open) > Date.parse(close)) {
        throw new ValidationError("INVALID_RESOLUTION_WINDOW", "ResolutionWindow openAt must be <= closeAt", { openAt: open, closeAt: close });
    }
    return deepFreeze({ openAt: open, closeAt: close });
};
//# sourceMappingURL=timestamp.vo.js.map