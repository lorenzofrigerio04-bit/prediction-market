import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryFetchRequest = (input) => deepFreeze({
    sourceDefinition: input.sourceDefinition,
    requestedAt: input.requestedAt,
    cursorNullable: input.cursorNullable,
    ...(input.manualPayloadNullable !== undefined && { manualPayloadNullable: input.manualPayloadNullable }),
});
//# sourceMappingURL=discovery-fetch-request.entity.js.map