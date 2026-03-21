import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID } from "../../schemas/governance-environment-binding.schema.js";
export const validateGovernanceEnvironmentBinding = (input, options) => {
    const schemaValidator = requireSchemaValidator(GOVERNANCE_ENVIRONMENT_BINDING_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("GovernanceEnvironmentBinding", input.id, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-governance-environment-binding.js.map