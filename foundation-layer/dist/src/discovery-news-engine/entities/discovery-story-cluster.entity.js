import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryStoryCluster = (input) => deepFreeze({
    ...input,
    memberItemIds: [...input.memberItemIds],
    memberSignalIds: [...(input.memberSignalIds ?? [])],
});
//# sourceMappingURL=discovery-story-cluster.entity.js.map