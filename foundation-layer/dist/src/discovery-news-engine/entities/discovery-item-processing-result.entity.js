import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryItemProcessingResult = (input) => deepFreeze({
    ...input,
    signalIdNullable: input.signalIdNullable ?? null,
    failureNullable: input.failureNullable ?? null,
});
//# sourceMappingURL=discovery-item-processing-result.entity.js.map