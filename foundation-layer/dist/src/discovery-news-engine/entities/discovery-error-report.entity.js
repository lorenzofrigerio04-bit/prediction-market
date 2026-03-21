import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryErrorReport = (input) => deepFreeze({
    ...input,
    failures: [...input.failures],
});
//# sourceMappingURL=discovery-error-report.entity.js.map