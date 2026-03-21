import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createNormalizedSourceReference = (input) => deepFreeze({
    sourceId: input.sourceId,
    locator: input.locator,
    labelNullable: input.labelNullable ?? null,
    sourceKeyNullable: input.sourceKeyNullable ?? null,
});
//# sourceMappingURL=normalized-source-reference.vo.js.map