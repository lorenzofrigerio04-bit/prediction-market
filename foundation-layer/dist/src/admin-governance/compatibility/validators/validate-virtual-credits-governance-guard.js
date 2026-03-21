import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { VIRTUAL_CREDITS_GOVERNANCE_GUARD_SCHEMA_ID } from "../../schemas/virtual-credits-governance-guard.schema.js";
export const validateVirtualCreditsGovernanceGuard = (input, options) => {
    const v = requireSchemaValidator(VIRTUAL_CREDITS_GOVERNANCE_GUARD_SCHEMA_ID);
    return buildValidationReport("VirtualCreditsGovernanceGuard", "virtual-credits-guard", validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-virtual-credits-governance-guard.js.map