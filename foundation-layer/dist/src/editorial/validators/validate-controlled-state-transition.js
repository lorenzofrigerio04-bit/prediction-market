import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { CONTROLLED_STATE_TRANSITION_SCHEMA_ID } from "../schemas/controlled-state-transition.schema.js";
import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";
const validateControlledTransitionInvariants = (input, context) => {
    const issues = [];
    if (context.audit_record === null) {
        issues.push(errorIssue("MISSING_AUDIT_RECORD", "/audit_record_id", "controlled state transition requires a linked audit record"));
    }
    else if (context.audit_record.id !== input.audit_record_id) {
        issues.push(errorIssue("AUDIT_REFERENCE_MISMATCH", "/audit_record_id", "audit_record_id must match linked audit record id"));
    }
    if (context.queue_entry.publishable_candidate_id !== input.publishable_candidate_id) {
        issues.push(errorIssue("PUBLISHABLE_CANDIDATE_MISMATCH", "/publishable_candidate_id", "transition candidate id must match queue entry candidate id"));
    }
    const finalStatus = context.publication_ready_artifact_nullable?.final_readiness_status;
    if (finalStatus === FinalReadinessStatus.APPROVED && context.approvals.length === 0) {
        issues.push(errorIssue("APPROVAL_REQUIRED", "/publication_ready_artifact_nullable/final_readiness_status", "approved readiness requires at least one approval decision"));
    }
    if (finalStatus === FinalReadinessStatus.APPROVED && context.rejections.length > 0) {
        issues.push(errorIssue("APPROVAL_REJECTION_CONFLICT", "/publication_ready_artifact_nullable/final_readiness_status", "approved readiness cannot coexist with terminal rejection"));
    }
    if (finalStatus === FinalReadinessStatus.APPROVED &&
        context.queue_entry.blocking_flags.some((item) => !item.is_resolved)) {
        issues.push(errorIssue("UNRESOLVED_BLOCKING_FLAGS", "/queue_entry/blocking_flags", "approved readiness is blocked by unresolved blocking flags"));
    }
    return issues;
};
export const validateControlledStateTransition = (input, options) => {
    const schemaValidator = requireSchemaValidator(CONTROLLED_STATE_TRANSITION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const invariantIssues = validateControlledTransitionInvariants(input, options.context);
    return buildValidationReport("ControlledStateTransition", input.id, [...schemaIssues, ...invariantIssues], resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-controlled-state-transition.js.map