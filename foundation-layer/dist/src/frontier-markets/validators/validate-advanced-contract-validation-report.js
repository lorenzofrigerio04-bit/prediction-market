import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { FUTURE_CONTRACT_TYPES } from "../../market-design/enums/contract-type.enum.js";
import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
import { ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID } from "../schemas/advanced-contract-validation-report.schema.js";
const validateReportInvariants = (input) => {
    const futureContractTypes = new Set(FUTURE_CONTRACT_TYPES);
    const issues = [];
    if (!futureContractTypes.has(input.contract_type)) {
        issues.push(errorIssue("ADVANCED_REPORT_CONTRACT_TYPE_INVALID", "/contract_type", "contract_type must be a frontier advanced contract type"));
    }
    if (input.checked_invariants.length === 0) {
        issues.push(errorIssue("ADVANCED_REPORT_INVARIANTS_EMPTY", "/checked_invariants", "checked_invariants must not be empty"));
    }
    if (input.validation_status === AdvancedValidationStatus.VALID && input.blocking_issues.length > 0) {
        issues.push(errorIssue("ADVANCED_REPORT_STATUS_INCONSISTENT", "/validation_status", "validation_status cannot be valid when blocking_issues exist"));
    }
    if (input.validation_status === AdvancedValidationStatus.INVALID && input.blocking_issues.length === 0) {
        issues.push(errorIssue("ADVANCED_REPORT_STATUS_INCONSISTENT", "/validation_status", "validation_status invalid requires at least one blocking issue"));
    }
    return issues;
};
export const validateAdvancedContractValidationReport = (input, options) => {
    const schemaValidator = requireSchemaValidator(ADVANCED_CONTRACT_VALIDATION_REPORT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateReportInvariants(input);
    return buildValidationReport("AdvancedContractValidationReport", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-advanced-contract-validation-report.js.map