import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryScheduleHint = (input) => deepFreeze({
    cronExpressionNullable: input.cronExpressionNullable ?? null,
    intervalSecondsNullable: input.intervalSecondsNullable ?? null,
});
//# sourceMappingURL=discovery-schedule-hint.vo.js.map