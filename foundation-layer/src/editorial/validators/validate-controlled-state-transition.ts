import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { ControlledStateTransition } from "../workflow/entities/controlled-state-transition.entity.js";
import { CONTROLLED_STATE_TRANSITION_SCHEMA_ID } from "../schemas/controlled-state-transition.schema.js";
import type { ControlledTransitionContext } from "../workflow/interfaces/controlled-state-transition-manager.js";
import { FinalReadinessStatus } from "../enums/final-readiness-status.enum.js";

const validateControlledTransitionInvariants = (
  input: ControlledStateTransition,
  context: ControlledTransitionContext,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (context.audit_record === null) {
    issues.push(
      errorIssue(
        "MISSING_AUDIT_RECORD",
        "/audit_record_id",
        "controlled state transition requires a linked audit record",
      ),
    );
  } else if (context.audit_record.id !== input.audit_record_id) {
    issues.push(
      errorIssue(
        "AUDIT_REFERENCE_MISMATCH",
        "/audit_record_id",
        "audit_record_id must match linked audit record id",
      ),
    );
  }

  if (context.queue_entry.publishable_candidate_id !== input.publishable_candidate_id) {
    issues.push(
      errorIssue(
        "PUBLISHABLE_CANDIDATE_MISMATCH",
        "/publishable_candidate_id",
        "transition candidate id must match queue entry candidate id",
      ),
    );
  }

  const finalStatus = context.publication_ready_artifact_nullable?.final_readiness_status;
  if (finalStatus === FinalReadinessStatus.APPROVED && context.approvals.length === 0) {
    issues.push(
      errorIssue(
        "APPROVAL_REQUIRED",
        "/publication_ready_artifact_nullable/final_readiness_status",
        "approved readiness requires at least one approval decision",
      ),
    );
  }
  if (finalStatus === FinalReadinessStatus.APPROVED && context.rejections.length > 0) {
    issues.push(
      errorIssue(
        "APPROVAL_REJECTION_CONFLICT",
        "/publication_ready_artifact_nullable/final_readiness_status",
        "approved readiness cannot coexist with terminal rejection",
      ),
    );
  }
  if (
    finalStatus === FinalReadinessStatus.APPROVED &&
    context.queue_entry.blocking_flags.some((item) => !item.is_resolved)
  ) {
    issues.push(
      errorIssue(
        "UNRESOLVED_BLOCKING_FLAGS",
        "/queue_entry/blocking_flags",
        "approved readiness is blocked by unresolved blocking flags",
      ),
    );
  }
  return issues;
};

export type ControlledTransitionValidationOptions = ValidationOptions & {
  context: ControlledTransitionContext;
};

export const validateControlledStateTransition = (
  input: ControlledStateTransition,
  options: ControlledTransitionValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CONTROLLED_STATE_TRANSITION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateControlledTransitionInvariants(input, options.context);
  return buildValidationReport(
    "ControlledStateTransition",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
