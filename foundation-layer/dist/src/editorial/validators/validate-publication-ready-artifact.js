import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { PUBLICATION_READY_ARTIFACT_SCHEMA_ID } from "../schemas/publication-ready-artifact.schema.js";
import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";
const validatePublicationReadyArtifactInvariants = (input) => {
    const issues = [];
    if (input.final_readiness_status === FinalReadinessStatus.APPROVED &&
        input.approved_artifacts.length === 0) {
        issues.push(errorIssue("MISSING_APPROVAL_DECISION", "/approved_artifacts", "approved readiness requires at least one approval decision reference"));
    }
    if (input.gating_summary.unresolved_blocking_flags_count > 0) {
        issues.push(errorIssue("UNRESOLVED_BLOCKING_FLAGS", "/gating_summary/unresolved_blocking_flags_count", "publication readiness fails with unresolved blocking flags"));
    }
    return issues;
};
export const validatePublicationReadyArtifact = (input, options) => {
    const schemaValidator = requireSchemaValidator(PUBLICATION_READY_ARTIFACT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validatePublicationReadyArtifactInvariants(input);
    return buildValidationReport("PublicationReadyArtifact", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-publication-ready-artifact.js.map