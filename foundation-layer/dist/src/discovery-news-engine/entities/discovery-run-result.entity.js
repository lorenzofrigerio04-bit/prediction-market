import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryRunResult = (input) => deepFreeze({
    ...input,
    finishedAtNullable: input.finishedAtNullable ?? null,
    errorReportNullable: input.errorReportNullable ?? null,
});
//# sourceMappingURL=discovery-run-result.entity.js.map