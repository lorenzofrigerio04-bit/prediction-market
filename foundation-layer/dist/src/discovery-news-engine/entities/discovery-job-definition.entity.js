import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryJobDefinition = (input) => deepFreeze({
    ...input,
    maxDurationSecondsNullable: input.maxDurationSecondsNullable ?? null,
});
//# sourceMappingURL=discovery-job-definition.entity.js.map