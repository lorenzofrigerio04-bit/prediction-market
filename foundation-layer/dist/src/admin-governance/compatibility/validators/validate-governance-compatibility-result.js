import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema } from "../../../validators/common/validation-result.js";
import { GOVERNANCE_COMPATIBILITY_RESULT_SCHEMA_ID } from "../../schemas/governance-compatibility-result.schema.js";
export const validateGovernanceCompatibilityResult = (input, options) => {
    const v = requireSchemaValidator(GOVERNANCE_COMPATIBILITY_RESULT_SCHEMA_ID);
    return buildValidationReport("GovernanceCompatibilityResult", input.id, validateBySchema(v, input), resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-governance-compatibility-result.js.map