import { ValidationError } from "../common/errors/validation-error.js";
export const createUrl = (value) => {
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        throw new ValidationError("INVALID_URL", "URL must be absolute", { value });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new ValidationError("UNSUPPORTED_URL_PROTOCOL", "Unsupported protocol", {
            protocol: parsed.protocol,
        });
    }
    return parsed.toString();
};
//# sourceMappingURL=url.vo.js.map