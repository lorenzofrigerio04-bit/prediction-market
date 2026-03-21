import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { FamilyCompatibilityStatus } from "../enums/family-compatibility-status.enum.js";
import { MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID } from "../schemas/market-family-compatibility-result.schema.js";
const validateInvariants = (input) => {
    const issues = [];
    if (Object.keys(input.mapped_artifact).length === 0) {
        issues.push(errorIssue("FAMILY_COMPATIBILITY_ARTIFACT_EMPTY", "/mapped_artifact", "mapped_artifact must not be empty"));
    }
    const readiness = input.mapped_artifact["readiness"];
    if (typeof readiness !== "string") {
        issues.push(errorIssue("FAMILY_COMPATIBILITY_READINESS_MISSING", "/mapped_artifact/readiness", "mapped_artifact.readiness is required"));
    }
    else if (readiness !== input.status) {
        issues.push(errorIssue("FAMILY_COMPATIBILITY_READINESS_MISMATCH", "/mapped_artifact/readiness", "mapped_artifact.readiness must match status"));
    }
    if (input.status === FamilyCompatibilityStatus.COMPATIBLE &&
        input.notes.some((note) => note.toLowerCase().includes("warning"))) {
        issues.push(errorIssue("FAMILY_COMPATIBILITY_STATUS_NOTE_MISMATCH", "/notes", "compatible status should not include warning notes"));
    }
    return issues;
};
export const validateMarketFamilyCompatibility = (input, options) => {
    const schemaValidator = requireSchemaValidator(MARKET_FAMILY_COMPATIBILITY_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateInvariants(input);
    return buildValidationReport("MarketFamilyCompatibilityResult", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-market-family-compatibility.js.map