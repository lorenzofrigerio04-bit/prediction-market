import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createFeatureFlagKey = (value) => {
    const normalized = createNonEmpty(value, "feature_flag_key");
    if (normalized.length > 128) {
        throw new ValidationError("FEATURE_FLAG_KEY_TOO_LONG", "feature_flag_key exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=feature-flag-key.vo.js.map