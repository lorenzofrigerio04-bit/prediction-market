import { ValidationError } from "../../../common/errors/validation-error.js";
import { deepFreeze } from "../../../common/utils/deep-freeze.js";
import { AdversarialType } from "../../enums/adversarial-type.enum.js";
import { RiskLevel } from "../../enums/risk-level.enum.js";
import { TargetModule } from "../../enums/target-module.enum.js";
import { createArtifactReferenceCollection } from "../../value-objects/artifact-reference.vo.js";
export const createAdversarialCase = (input) => {
    if (!Object.values(TargetModule).includes(input.target_module)) {
        throw new ValidationError("INVALID_ADVERSARIAL_CASE", "target_module is invalid");
    }
    if (!Object.values(AdversarialType).includes(input.adversarial_type)) {
        throw new ValidationError("INVALID_ADVERSARIAL_CASE", "adversarial_type is invalid");
    }
    if (!Object.values(RiskLevel).includes(input.risk_level)) {
        throw new ValidationError("INVALID_ADVERSARIAL_CASE", "risk_level is invalid");
    }
    if (input.active && input.expected_rejection_or_behavior.trim().length === 0) {
        throw new ValidationError("INVALID_ADVERSARIAL_CASE", "AdversarialCase.expected_rejection_or_behavior is required when active is true");
    }
    return deepFreeze({
        ...input,
        crafted_input_refs: createArtifactReferenceCollection(input.crafted_input_refs, "AdversarialCase.crafted_input_refs"),
        expected_rejection_or_behavior: input.expected_rejection_or_behavior.trim(),
    });
};
//# sourceMappingURL=adversarial-case.entity.js.map