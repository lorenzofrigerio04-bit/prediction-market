import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { OverrideStatus } from "../../enums/override-status.enum.js";
import { OVERRIDE_REQUEST_SCHEMA_ID } from "../../schemas/override-request.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (input.expires_at_nullable !== null && input.expires_at_nullable <= input.requested_at) {
        issues.push(errorIssue("OVERRIDE_EXPIRATION_ORDER_INVALID", "/expires_at_nullable", "expires_at_nullable must be after requested_at"));
    }
    if ((input.status === OverrideStatus.APPROVED || input.status === OverrideStatus.REJECTED) && input.resolved_by_nullable === null) {
        issues.push(errorIssue("OVERRIDE_RESOLVER_REQUIRED", "/resolved_by_nullable", "resolved_by_nullable is required for terminal statuses"));
    }
    return issues;
};
export const validateOverrideRequest = (input, options) => {
    const schemaValidator = requireSchemaValidator(OVERRIDE_REQUEST_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("OverrideRequest", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-override-request.js.map