import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createEventLead = (input) => {
    const { cautionFlags, missingConditionsNullable, ...rest } = input;
    return deepFreeze({
        ...rest,
        reasons: [...input.reasons],
        ...(cautionFlags != null && cautionFlags.length > 0
            ? { cautionFlags: [...cautionFlags] }
            : {}),
        ...(missingConditionsNullable != null &&
            missingConditionsNullable.length > 0
            ? { missingConditionsNullable: [...missingConditionsNullable] }
            : {}),
    });
};
//# sourceMappingURL=event-lead.entity.js.map