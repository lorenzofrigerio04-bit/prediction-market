import { errorIssue } from "../../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../../validators/common/validation-result.js";
import { ReadinessStatus } from "../../enums/readiness-status.enum.js";
import { DELIVERY_READINESS_REPORT_SCHEMA_ID } from "../../schemas/delivery-readiness-report.schema.js";
const validateDeliveryReadinessReportInvariants = (input) => {
    const issues = [];
    if (input.publication_package_id.trim().length === 0) {
        issues.push(errorIssue("PUBLICATION_PACKAGE_REQUIRED", "/publication_package_id", "publication_package_id is required"));
    }
    if ((input.readiness_status === ReadinessStatus.FAILED ||
        input.readiness_status === ReadinessStatus.BLOCKED) &&
        input.blocking_issues.length === 0) {
        issues.push(errorIssue("BLOCKING_ISSUES_REQUIRED", "/blocking_issues", "FAILED/BLOCKED readiness requires blocking_issues"));
    }
    if (input.readiness_status === ReadinessStatus.READY && input.blocking_issues.length > 0) {
        issues.push(errorIssue("READY_CANNOT_HAVE_BLOCKING_ISSUES", "/blocking_issues", "READY readiness cannot include blocking_issues"));
    }
    return issues;
};
export const validateDeliveryReadinessReport = (input, options) => {
    const schemaValidator = requireSchemaValidator(DELIVERY_READINESS_REPORT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateDeliveryReadinessReportInvariants(input);
    return buildValidationReport("DeliveryReadinessReport", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-delivery-readiness-report.js.map