import { ValidationError } from "../../common/errors/validation-error.js";
import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createNormalizedDiscoveryPayload = (input) => {
    if (input.items.length === 0) {
        throw new ValidationError("INVALID_NORMALIZED_DISCOVERY_PAYLOAD", "items must contain at least one item");
    }
    return deepFreeze({
        items: [...input.items],
        provenanceMetadata: input.provenanceMetadata,
        sourceId: input.sourceId,
    });
};
//# sourceMappingURL=normalized-discovery-payload.entity.js.map