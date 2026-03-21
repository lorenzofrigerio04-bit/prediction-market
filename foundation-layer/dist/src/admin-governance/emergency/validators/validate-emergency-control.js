import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { EMERGENCY_CONTROL_SCHEMA_ID } from "../../schemas/emergency-control.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.expires_at_nullable !== null && input.expires_at_nullable <= input.activated_at) {
        issues.push(errorIssue("EMERGENCY_EXPIRATION_ORDER_INVALID", "/expires_at_nullable", "expires_at_nullable must be after activated_at"));
    }
    return issues;
};
export const validateEmergencyControl = (input, options) => {
    const schemaValidator = requireSchemaValidator(EMERGENCY_CONTROL_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("EmergencyControl", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-emergency-control.js.map