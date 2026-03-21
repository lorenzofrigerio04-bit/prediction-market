import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { DependencyStrength } from "../../enums/dependency-strength.enum.js";
import { DependencyType } from "../../enums/dependency-type.enum.js";
const normalizeRef = (ref, field) => {
    if (ref.ref_id.trim().length === 0) {
        throw new ValidationError("INVALID_DEPENDENCY_LINK", `${field}.ref_id must be non-empty`);
    }
    return {
        ...ref,
        ref_id: ref.ref_id.trim(),
    };
};
export const createDependencyLink = (input) => {
    if (!Object.values(DependencyType).includes(input.dependency_type)) {
        throw new ValidationError("INVALID_DEPENDENCY_LINK", "dependency_type is invalid");
    }
    if (!Object.values(DependencyStrength).includes(input.dependency_strength)) {
        throw new ValidationError("INVALID_DEPENDENCY_LINK", "dependency_strength is invalid");
    }
    const sourceRef = normalizeRef(input.source_ref, "source_ref");
    const targetRef = normalizeRef(input.target_ref, "target_ref");
    if (sourceRef.ref_type === targetRef.ref_type &&
        sourceRef.ref_id === targetRef.ref_id) {
        throw new ValidationError("INVALID_DEPENDENCY_LINK", "self dependency links are not allowed");
    }
    return deepFreeze({
        ...input,
        source_ref: sourceRef,
        target_ref: targetRef,
    });
};
//# sourceMappingURL=dependency-link.entity.js.map