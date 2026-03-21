import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createEventLeadEvidenceSet = (input) => {
    const { memberSignalIds, ...rest } = input;
    return deepFreeze({
        ...rest,
        memberItemIds: [...input.memberItemIds],
        ...(memberSignalIds != null && memberSignalIds.length > 0
            ? { memberSignalIds: [...memberSignalIds] }
            : {}),
    });
};
//# sourceMappingURL=event-lead-evidence-set.entity.js.map