import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryStoryClusterSummary = (input) => deepFreeze({
    ...input,
    memberIds: {
        itemIds: [...input.memberIds.itemIds],
        ...(input.memberIds.signalIds != null && input.memberIds.signalIds.length > 0
            ? { signalIds: [...input.memberIds.signalIds] }
            : {}),
    },
});
//# sourceMappingURL=discovery-story-cluster-summary.entity.js.map