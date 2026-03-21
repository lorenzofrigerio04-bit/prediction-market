import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID } from "../../schemas/platform-access-governance-context.schema.js";
export const validatePlatformAccessGovernanceContext = (input, options) => {
    const v = requireSchemaValidator(PLATFORM_ACCESS_GOVERNANCE_CONTEXT_SCHEMA_ID);
    return buildValidationReport("PlatformAccessGovernanceContext", input.module_key, validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-platform-access-governance-context.js.map