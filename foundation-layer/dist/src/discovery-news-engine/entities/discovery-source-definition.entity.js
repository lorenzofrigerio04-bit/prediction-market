import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoverySourceDefinition = (input) => deepFreeze({
    ...input,
    roleNullable: input.roleNullable ?? null,
});
//# sourceMappingURL=discovery-source-definition.entity.js.map