import { ActionKey } from "../enums/action-key.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { CandidateDetailView } from "../candidates/entities/candidate-detail-view.entity.js";
import { CANDIDATE_DETAIL_VIEW_SCHEMA_ID } from "../schemas/candidate-detail-view.schema.js";

const validateCandidateDetailInvariants = (input: CandidateDetailView): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.candidate_ref.trim().length === 0) {
    issues.push(errorIssue("CANDIDATE_REF_REQUIRED", "/candidate_ref", "candidate_ref must not be empty"));
  }
  if (!input.candidate_ref.startsWith("cdr_")) {
    issues.push(errorIssue("CANDIDATE_REF_INVALID_PREFIX", "/candidate_ref", "candidate_ref must use cdr_ prefix"));
  }
  if (input.visibility_status === VisibilityStatus.HIDDEN && input.visible_actions.length > 0) {
    issues.push(
      errorIssue(
        "HIDDEN_CANDIDATE_VIEW_ACTIONS_NOT_ALLOWED",
        "/visible_actions",
        "hidden candidate detail cannot expose visible_actions",
      ),
    );
  }
  if (input.visibility_status === VisibilityStatus.VISIBLE && input.visible_actions.includes(ActionKey.OPEN_DETAIL) === false) {
    issues.push(
      errorIssue(
        "VISIBLE_CANDIDATE_VIEW_REQUIRES_OPEN_DETAIL",
        "/visible_actions",
        "visible candidate detail should include open_detail action",
      ),
    );
  }
  return issues;
};

export const validateCandidateDetailView = (
  input: CandidateDetailView,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CANDIDATE_DETAIL_VIEW_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateCandidateDetailInvariants(input);
  return buildValidationReport(
    "CandidateDetailView",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
