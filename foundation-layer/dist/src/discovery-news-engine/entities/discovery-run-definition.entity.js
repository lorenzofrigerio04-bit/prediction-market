import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryRunDefinition = (input) => deepFreeze({
    ...input,
    sourceIds: [...input.sourceIds],
    scheduleHintNullable: input.scheduleHintNullable ?? null,
    executionWindowNullable: input.executionWindowNullable ?? null,
});
//# sourceMappingURL=discovery-run-definition.entity.js.map