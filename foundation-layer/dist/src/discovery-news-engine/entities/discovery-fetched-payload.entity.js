import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryFetchedPayload = (input) => deepFreeze({
    raw: { ...input.raw },
    transportMetadata: input.transportMetadata,
});
//# sourceMappingURL=discovery-fetched-payload.entity.js.map