import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createDiscoveryRankingEntry = (input) => {
    const { cautionFlags, orderingBasis, ...rest } = input;
    return deepFreeze({
        ...rest,
        reasons: [...input.reasons],
        ...(cautionFlags != null && cautionFlags.length > 0
            ? { cautionFlags: [...cautionFlags] }
            : {}),
        ...(orderingBasis != null && orderingBasis.length > 0
            ? { orderingBasis: [...orderingBasis] }
            : {}),
    });
};
//# sourceMappingURL=discovery-ranking-entry.entity.js.map