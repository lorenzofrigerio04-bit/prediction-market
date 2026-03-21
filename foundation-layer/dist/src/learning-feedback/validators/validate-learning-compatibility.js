import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { LearningCompatibilityStatus } from "../enums/learning-compatibility-status.enum.js";
import { LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID } from "../schemas/learning-compatibility-result.schema.js";
const validateCompatibilityInvariants = (input) => {
    const issues = [];
    if (input.correlation_id.trim().length === 0) {
        issues.push(errorIssue("COMPATIBILITY_CORRELATION_ID_REQUIRED", "/correlation_id", "correlation_id is required"));
    }
    if (Object.keys(input.mapped_artifact).length === 0) {
        issues.push(errorIssue("COMPATIBILITY_MAPPED_ARTIFACT_EMPTY", "/mapped_artifact", "mapped_artifact must not be empty"));
    }
    const sourceId = input.mapped_artifact["source_id"];
    if (typeof sourceId !== "string" || sourceId.trim().length === 0) {
        issues.push(errorIssue("COMPATIBILITY_SOURCE_ID_MISSING", "/mapped_artifact/source_id", "mapped_artifact.source_id is required"));
    }
    const targetId = input.mapped_artifact["target_id"];
    if (typeof targetId !== "string" || targetId.trim().length === 0) {
        issues.push(errorIssue("COMPATIBILITY_TARGET_ID_MISSING", "/mapped_artifact/target_id", "mapped_artifact.target_id is required"));
    }
    const readiness = input.mapped_artifact["readiness"];
    if (typeof readiness !== "string") {
        issues.push(errorIssue("COMPATIBILITY_READINESS_MISSING", "/mapped_artifact/readiness", "mapped_artifact.readiness is required"));
    }
    else if (readiness !== input.status) {
        issues.push(errorIssue("COMPATIBILITY_READINESS_MISMATCH", "/mapped_artifact/readiness", "mapped_artifact.readiness must match status"));
    }
    const lossy = input.mapped_artifact["lossy_fields"];
    if (!Array.isArray(lossy)) {
        issues.push(errorIssue("COMPATIBILITY_LOSSY_FIELDS_MISSING", "/mapped_artifact/lossy_fields", "mapped_artifact.lossy_fields must be an array"));
    }
    if (input.status === LearningCompatibilityStatus.COMPATIBLE &&
        input.notes.some((note) => note.toLowerCase().includes("incompatible"))) {
        issues.push(errorIssue("COMPATIBILITY_STATUS_NOTE_MISMATCH", "/notes", "compatible status cannot contain incompatible notes"));
    }
    return issues;
};
export const validateLearningCompatibility = (input, options) => {
    const schemaValidator = requireSchemaValidator(LEARNING_COMPATIBILITY_RESULT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateCompatibilityInvariants(input);
    return buildValidationReport("LearningCompatibilityResult", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-learning-compatibility.js.map