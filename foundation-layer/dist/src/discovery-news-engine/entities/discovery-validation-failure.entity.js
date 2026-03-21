import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryValidationFailure = (input) => deepFreeze({
    ...input,
    contextNullable: input.contextNullable ?? null,
});
//# sourceMappingURL=discovery-validation-failure.entity.js.map