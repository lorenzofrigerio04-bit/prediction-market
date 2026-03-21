import { errorIssue } from "../../entities/validation-report.entity.js";
import { ReleaseReadinessStatus } from "../enums/release-readiness-status.enum.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID } from "../schemas/pipeline-health-snapshot.schema.js";
const validatePipelineHealthSnapshotInvariants = (input) => {
    const issues = [];
    if (input.release_readiness_status === ReleaseReadinessStatus.READY && input.blocking_issues.length > 0) {
        issues.push(errorIssue("READY_WITH_BLOCKING_ISSUES", "/release_readiness_status", "PipelineHealthSnapshot.releaseReadinessStatus cannot be READY when blockingIssues are present"));
    }
    return issues;
};
export const validatePipelineHealthSnapshot = (input, options) => {
    const schemaValidator = requireSchemaValidator(PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validatePipelineHealthSnapshotInvariants(input);
    return buildValidationReport("PipelineHealthSnapshot", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-pipeline-health-snapshot.js.map