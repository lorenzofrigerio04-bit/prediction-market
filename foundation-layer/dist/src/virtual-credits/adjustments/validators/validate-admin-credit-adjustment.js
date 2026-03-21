import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID } from "../../schemas/admin-credit-adjustment.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (!Number.isFinite(input.amount_delta) || input.amount_delta === 0) {
        issues.push(errorIssue("ADJUSTMENT_AMOUNT_DELTA_INVALID", "/amount_delta", "amount_delta must be finite and non-zero"));
    }
    if (input.audit_ref.length === 0) {
        issues.push(errorIssue("ADJUSTMENT_AUDIT_REF_REQUIRED", "/audit_ref", "audit_ref is required"));
    }
    if (input.adjustment_reason.length === 0) {
        issues.push(errorIssue("ADJUSTMENT_REASON_REQUIRED", "/adjustment_reason", "adjustment_reason is required"));
    }
    return issues;
};
export const validateAdminCreditAdjustment = (input, options) => {
    const schemaValidator = requireSchemaValidator(ADMIN_CREDIT_ADJUSTMENT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("AdminCreditAdjustment", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-admin-credit-adjustment.js.map