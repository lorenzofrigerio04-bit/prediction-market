import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoverySignal = (input) => deepFreeze({
    ...input,
    evidenceRefs: [...input.evidenceRefs],
});
//# sourceMappingURL=discovery-signal.entity.js.map