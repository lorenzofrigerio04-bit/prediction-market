import { deepFreeze } from "../../common/utils/deep-freeze.js";
export const createMetadata = (value) => {
    const normalized = {};
    for (const [key, item] of Object.entries(value ?? {})) {
        if (key.trim().length === 0) {
            continue;
        }
        normalized[key] = String(item);
    }
    return deepFreeze(normalized);
};
//# sourceMappingURL=metadata.vo.js.map