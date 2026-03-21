import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createEventLeadExtractionDecisionLead = (input) => deepFreeze({ ...input });
export const createEventLeadExtractionDecisionNotExtracted = (input) => deepFreeze({
    ...input,
    reasons: [...input.reasons],
    missingConditions: [...input.missingConditions],
});
//# sourceMappingURL=event-lead-extraction-decision.entity.js.map