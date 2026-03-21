import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CannibalizationStatus } from "../enums/cannibalization-status.enum.js";
import { CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID } from "../schemas/cannibalization-check-result.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    const pairKeys = new Set();
    for (const [index, pair] of input.checked_market_pairs.entries()) {
        if (pair.source_market_ref === pair.target_market_ref) {
            issues.push(errorIssue("CANNIBALIZATION_SELF_PAIR", `/checked_market_pairs/${index}`, "checked market pair must reference two different markets"));
        }
        const key = `${pair.source_market_ref}|${pair.target_market_ref}`;
        if (pairKeys.has(key)) {
            issues.push(errorIssue("CANNIBALIZATION_DUPLICATE_PAIR", "/checked_market_pairs", "checked market pairs must be unique"));
            break;
        }
        pairKeys.add(key);
    }
    if (input.check_status === CannibalizationStatus.BLOCKING && input.blocking_conflicts.length === 0) {
        issues.push(errorIssue("CANNIBALIZATION_BLOCKING_EMPTY", "/blocking_conflicts", "blocking check status requires blocking conflicts"));
    }
    if (input.check_status !== CannibalizationStatus.BLOCKING && input.blocking_conflicts.length > 0) {
        issues.push(errorIssue("CANNIBALIZATION_STATUS_CONFLICT", "/check_status", "non-blocking check status cannot include blocking conflicts"));
    }
    if (input.check_status === CannibalizationStatus.PASS && input.warnings.length > 0) {
        issues.push(errorIssue("CANNIBALIZATION_PASS_WITH_WARNINGS", "/warnings", "pass check status cannot include warnings"));
    }
    return issues;
};
export const validateCannibalizationCheckResult = (input, options) => {
    const schemaValidator = requireSchemaValidator(CANNIBALIZATION_CHECK_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("CannibalizationCheckResult", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-cannibalization-check-result.js.map