import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { GOVERNANCE_SOURCE_SCHEMA_ID } from "../../schemas/governance-source.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.trust_weight < 0 || input.trust_weight > 1) {
        issues.push(errorIssue("SOURCE_TRUST_WEIGHT_OUT_OF_RANGE", "/trust_weight", "trust_weight must be in range [0,1]"));
    }
    return issues;
};
export const validateGovernanceSource = (input, options) => {
    const schemaValidator = requireSchemaValidator(GOVERNANCE_SOURCE_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("GovernanceSource", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-governance-source.js.map