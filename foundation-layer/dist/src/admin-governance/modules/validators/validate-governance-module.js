import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { GOVERNANCE_MODULE_SCHEMA_ID } from "../../schemas/governance-module.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (new Set(input.supported_operations).size !== input.supported_operations.length) {
        issues.push(errorIssue("MODULE_OPERATIONS_DUPLICATE", "/supported_operations", "supported_operations must be unique"));
    }
    return issues;
};
export const validateGovernanceModule = (input, options) => {
    const schemaValidator = requireSchemaValidator(GOVERNANCE_MODULE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("GovernanceModule", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-governance-module.js.map