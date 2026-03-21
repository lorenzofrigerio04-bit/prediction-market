import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryTransportMetadata = (input) => deepFreeze({
    ...input,
    statusCodeNullable: input.statusCodeNullable ?? null,
    etagNullable: input.etagNullable ?? null,
});
//# sourceMappingURL=discovery-transport-metadata.entity.js.map