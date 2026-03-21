import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryTrendEvaluationDecision = (input) => deepFreeze({
    ...input,
    ruleIdNullable: input.ruleIdNullable ?? null,
});
//# sourceMappingURL=discovery-trend-evaluation-decision.entity.js.map