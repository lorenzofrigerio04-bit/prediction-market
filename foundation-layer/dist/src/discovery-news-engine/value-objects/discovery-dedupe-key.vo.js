import { ValidationError } from "../../common/errors/validation-error.js";
export const createDiscoveryDedupeKey = (value) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        throw new ValidationError("INVALID_DISCOVERY_DEDUPE_KEY", "DiscoveryDedupeKey must be non-empty");
    }
    return trimmed;
};
//# sourceMappingURL=discovery-dedupe-key.vo.js.map