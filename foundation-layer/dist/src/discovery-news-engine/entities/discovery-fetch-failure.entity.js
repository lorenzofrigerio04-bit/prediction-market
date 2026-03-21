import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryFetchFailure = (input) => deepFreeze({
    ...input,
    detailsNullable: input.detailsNullable ?? null,
});
//# sourceMappingURL=discovery-fetch-failure.entity.js.map