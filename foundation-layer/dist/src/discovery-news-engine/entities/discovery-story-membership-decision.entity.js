import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryStoryMembershipDecision = (input) => deepFreeze({
    ...input,
    matchedMemberIdNullable: input.matchedMemberIdNullable ?? null,
});
//# sourceMappingURL=discovery-story-membership-decision.entity.js.map