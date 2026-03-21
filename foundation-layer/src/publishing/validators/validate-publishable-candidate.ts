import { type ValidationIssue, type ValidationReport, errorIssue } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { PublishableCandidateStatus } from "../enums/publishable-candidate-status.enum.js";
import type { PublishableCandidate } from "../candidate/entities/publishable-candidate.entity.js";
import { PUBLISHABLE_CANDIDATE_SCHEMA_ID } from "../schemas/publishable-candidate.schema.js";
import type { TitleSet } from "../titles/entities/title-set.entity.js";
import type { ResolutionSummary } from "../summaries/entities/resolution-summary.entity.js";
import {
  REQUIRED_RULEBOOK_SECTION_TYPES,
  type RulebookCompilation,
} from "../rulebook/entities/rulebook-compilation.entity.js";

export type PublishableCandidateLinkedArtifacts = Readonly<{
  title_set_nullable?: TitleSet | null;
  resolution_summary_nullable?: ResolutionSummary | null;
  rulebook_compilation_nullable?: RulebookCompilation | null;
}>;

export type PublishableCandidateValidationOptions = ValidationOptions & {
  linked_artifacts?: PublishableCandidateLinkedArtifacts;
};

const validatePublishableCandidateInvariants = (
  input: PublishableCandidate,
  linkedArtifacts?: PublishableCandidateLinkedArtifacts,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.title_set_id.trim().length === 0) {
    issues.push(errorIssue("MISSING_TITLE_SET_ID", "/title_set_id", "title_set_id is required"));
  }
  if (input.resolution_summary_id.trim().length === 0) {
    issues.push(
      errorIssue("MISSING_RESOLUTION_SUMMARY_ID", "/resolution_summary_id", "resolution_summary_id is required"),
    );
  }
  if (input.rulebook_compilation_id.trim().length === 0) {
    issues.push(
      errorIssue(
        "MISSING_RULEBOOK_COMPILATION_ID",
        "/rulebook_compilation_id",
        "rulebook_compilation_id is required",
      ),
    );
  }
  if (
    input.candidate_status === PublishableCandidateStatus.STRUCTURALLY_READY &&
    input.blocking_issues.length > 0
  ) {
    issues.push(
      errorIssue(
        "INVALID_CANDIDATE_STATUS",
        "/candidate_status",
        "STRUCTURALLY_READY candidate cannot contain blocking issues",
      ),
    );
  }
  if (linkedArtifacts !== undefined) {
    const titleSet = linkedArtifacts.title_set_nullable;
    if (titleSet === null || titleSet === undefined) {
      issues.push(
        errorIssue(
          "MISSING_TITLE_SET_ARTIFACT",
          "/linked_artifacts/title_set_nullable",
          "title_set artifact is required for structural candidate validation",
        ),
      );
    } else {
      if (titleSet.canonical_title.trim().length === 0) {
        issues.push(
          errorIssue(
            "MISSING_CANONICAL_TITLE",
            "/linked_artifacts/title_set_nullable/canonical_title",
            "canonical_title is required",
          ),
        );
      }
      if (titleSet.display_title.trim().length === 0) {
        issues.push(
          errorIssue(
            "MISSING_DISPLAY_TITLE",
            "/linked_artifacts/title_set_nullable/display_title",
            "display_title is required",
          ),
        );
      }
    }

    const resolutionSummary = linkedArtifacts.resolution_summary_nullable;
    if (resolutionSummary === null || resolutionSummary === undefined) {
      issues.push(
        errorIssue(
          "MISSING_RESOLUTION_SUMMARY_ARTIFACT",
          "/linked_artifacts/resolution_summary_nullable",
          "resolution_summary artifact is required for structural candidate validation",
        ),
      );
    } else if (resolutionSummary.one_line_resolution_summary.trim().length === 0) {
      issues.push(
        errorIssue(
          "MISSING_ONE_LINE_RESOLUTION_SUMMARY",
          "/linked_artifacts/resolution_summary_nullable/one_line_resolution_summary",
          "one_line_resolution_summary is required",
        ),
      );
    }

    const rulebookCompilation = linkedArtifacts.rulebook_compilation_nullable;
    if (rulebookCompilation === null || rulebookCompilation === undefined) {
      issues.push(
        errorIssue(
          "MISSING_RULEBOOK_COMPILATION_ARTIFACT",
          "/linked_artifacts/rulebook_compilation_nullable",
          "rulebook_compilation artifact is required for structural candidate validation",
        ),
      );
    } else {
      const sectionTypes = new Set(
        rulebookCompilation.included_sections.map((section) => section.section_type),
      );
      for (const requiredType of REQUIRED_RULEBOOK_SECTION_TYPES) {
        if (!sectionTypes.has(requiredType)) {
          issues.push(
            errorIssue(
              "MISSING_REQUIRED_RULEBOOK_SECTION",
              "/linked_artifacts/rulebook_compilation_nullable/included_sections",
              `Missing required section type: ${requiredType}`,
            ),
          );
        }
      }
    }
  }
  return issues;
};

export const validatePublishableCandidate = (
  input: PublishableCandidate,
  options?: PublishableCandidateValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PUBLISHABLE_CANDIDATE_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [
    ...schemaIssues,
    ...validatePublishableCandidateInvariants(input, options?.linked_artifacts),
  ];
  return buildValidationReport("PublishableCandidate", input.id, issues, resolveGeneratedAt(options));
};
