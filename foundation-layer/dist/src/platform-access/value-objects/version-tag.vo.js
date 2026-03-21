import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmptyTrimmed } from "./platform-access-shared.vo.js";
const VERSION_TAG_PATTERN = /^v\d+\.\d+\.\d+$/;
export const createVersionTag = (value) => {
    const normalized = createNonEmptyTrimmed(value, "INVALID_VERSION_TAG", "version_tag");
    if (!VERSION_TAG_PATTERN.test(normalized)) {
        throw new ValidationError("INVALID_VERSION_TAG", "version_tag must follow v<major>.<minor>.<patch>");
    }
    return normalized;
};
//# sourceMappingURL=version-tag.vo.js.map