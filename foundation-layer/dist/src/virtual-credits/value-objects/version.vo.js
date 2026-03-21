import { ValidationError } from "../../common/errors/validation-error.js";
export const createVersion = (value) => {
    if (!/^v\d+\.\d+\.\d+$/.test(value)) {
        throw new ValidationError("INVALID_VERSION", "version must match v<major>.<minor>.<patch>", { value });
    }
    return value;
};
//# sourceMappingURL=version.vo.js.map