import { ValidationError } from "../../common/errors/validation-error.js";
const KEY_PATTERN = /^[a-z0-9][a-z0-9_-]{2,62}$/;
export const createDiscoverySourceKey = (value) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new ValidationError("INVALID_DISCOVERY_SOURCE_KEY", "DiscoverySourceKey must be non-empty");
    }
    if (!KEY_PATTERN.test(trimmed)) {
        throw new ValidationError("INVALID_DISCOVERY_SOURCE_KEY", "DiscoverySourceKey must match pattern", {
            value: trimmed,
        });
    }
    return trimmed;
};
//# sourceMappingURL=discovery-source-key.vo.js.map