import { ValidationError } from "../errors/validation-error.js";
const ID_BODY_PATTERN = "[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}";
export const createPrefixedId = (value, prefix, brand) => {
    const pattern = new RegExp(`^${prefix}${ID_BODY_PATTERN}$`);
    if (!pattern.test(value)) {
        throw new ValidationError("INVALID_ID", `Invalid ${brand} format`, {
            expectedPrefix: prefix,
            value,
        });
    }
    return value;
};
//# sourceMappingURL=id.js.map