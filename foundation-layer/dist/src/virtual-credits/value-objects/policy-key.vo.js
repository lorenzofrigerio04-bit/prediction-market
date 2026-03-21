import { ValidationError } from "../../common/errors/validation-error.js";
import { createNonEmpty } from "./shared.vo.js";
export const createPolicyKey = (value) => {
    const normalized = createNonEmpty(value, "policyKey");
    if (normalized.length > 512) {
        throw new ValidationError("POLICY_KEY_EMPTY", "PolicyKey exceeds max length", { length: normalized.length });
    }
    return normalized;
};
//# sourceMappingURL=policy-key.vo.js.map