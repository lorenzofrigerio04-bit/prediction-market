import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { PublicationHandoff } from "../entities/publication-handoff.entity.js";
import { PUBLICATION_HANDOFF_SCHEMA_ID } from "../../schemas/publication-handoff.schema.js";

const validatePublicationHandoffInvariants = (input: PublicationHandoff): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.audit_ref.trim().length === 0) {
    issues.push(errorIssue("AUDIT_LINKAGE_REQUIRED", "/audit_ref", "publication handoff must be audit-linked"));
  }
  if (input.initiated_by.trim().length === 0) {
    issues.push(errorIssue("INITIATED_BY_REQUIRED", "/initiated_by", "initiated_by is required"));
  }
  if (input.publication_package_id.trim().length === 0) {
    issues.push(
      errorIssue(
        "PUBLICATION_PACKAGE_REQUIRED",
        "/publication_package_id",
        "publication_package_id is required",
      ),
    );
  }
  if (input.delivery_notes.some((note) => note.trim().length === 0)) {
    issues.push(errorIssue("DELIVERY_NOTE_EMPTY", "/delivery_notes", "delivery_notes cannot contain empty values"));
  }
  return issues;
};

export const validatePublicationHandoff = (
  input: PublicationHandoff,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PUBLICATION_HANDOFF_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validatePublicationHandoffInvariants(input);
  return buildValidationReport(
    "PublicationHandoff",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
