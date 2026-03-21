import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { AdvancedCompatibilityStatus } from "../enums/advanced-compatibility-status.enum.js";
import { AdvancedValidationStatus } from "../enums/advanced-validation-status.enum.js";
import { ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID } from "../schemas/advanced-market-compatibility-result.schema.js";
const validateCompatibilityInvariants = (input) => {
    const issues = [];
    if (input.status === AdvancedCompatibilityStatus.COMPATIBLE &&
        input.notes.some((note) => note.toLowerCase().includes("warning"))) {
        issues.push(errorIssue("COMPATIBILITY_STATUS_NOTE_MISMATCH", "/notes", "compatible status should not include warning notes"));
    }
    if (Object.keys(input.mapped_artifact).length === 0) {
        issues.push(errorIssue("COMPATIBILITY_ARTIFACT_EMPTY", "/mapped_artifact", "mapped_artifact must not be empty"));
    }
    const readiness = input.mapped_artifact["readiness"];
    if (typeof readiness !== "string") {
        issues.push(errorIssue("COMPATIBILITY_READINESS_MISSING", "/mapped_artifact/readiness", "mapped_artifact.readiness is required"));
    }
    else if (readiness !== input.status) {
        issues.push(errorIssue("COMPATIBILITY_READINESS_STATUS_MISMATCH", "/mapped_artifact/readiness", "mapped_artifact.readiness must match status"));
    }
    const validationStatus = input.mapped_artifact["validation_status"];
    if (validationStatus === AdvancedValidationStatus.INVALID &&
        input.status === AdvancedCompatibilityStatus.COMPATIBLE) {
        issues.push(errorIssue("COMPATIBILITY_PROMOTION_BLOCKED_BY_VALIDATION_STATUS", "/status", "compatibility cannot be compatible when validation_status is invalid"));
    }
    return issues;
};
export const validateFrontierMarketCompatibility = (input, options) => {
    const schemaValidator = requireSchemaValidator(ADVANCED_MARKET_COMPATIBILITY_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateCompatibilityInvariants(input);
    return buildValidationReport("AdvancedMarketCompatibilityResult", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-frontier-market-compatibility.js.map