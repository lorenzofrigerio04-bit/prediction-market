import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoverySourceEndpoint = (input) => {
    const url = input.url.trim();
    if (url.length === 0) {
        throw new ValidationError("INVALID_DISCOVERY_SOURCE_ENDPOINT", "url must be non-empty");
    }
    const method = input.method.trim().toUpperCase();
    if (method.length === 0) {
        throw new ValidationError("INVALID_DISCOVERY_SOURCE_ENDPOINT", "method must be non-empty");
    }
    return deepFreeze({
        url,
        method,
        headersNullable: input.headersNullable ?? null,
    });
};
//# sourceMappingURL=discovery-source-endpoint.entity.js.map