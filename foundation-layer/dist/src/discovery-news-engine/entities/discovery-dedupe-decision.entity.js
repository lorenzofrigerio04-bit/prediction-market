import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryDedupeDecision = (input) => deepFreeze({ ...input });
export const createDiscoveryDedupeDecisionV1 = (input) => deepFreeze({
    ...input,
    matchedKey: input.matchedKey ?? null,
    matchedCandidateIdNullable: input.matchedCandidateIdNullable ?? null,
    evidenceStrengthNullable: input.evidenceStrengthNullable ?? null,
});
//# sourceMappingURL=discovery-dedupe-decision.entity.js.map