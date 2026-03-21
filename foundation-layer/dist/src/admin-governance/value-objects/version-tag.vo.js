import { ValidationError } from "../../common/errors/validation-error.js";
const VERSION_PATTERN = /^v\d+\.\d+\.\d+$/;
export const createVersionTag = (value) => {
    if (!VERSION_PATTERN.test(value)) {
        throw new ValidationError("INVALID_VERSION_TAG", "version_tag must follow vX.Y.Z", { value });
    }
    return value;
};
//# sourceMappingURL=version-tag.vo.js.map