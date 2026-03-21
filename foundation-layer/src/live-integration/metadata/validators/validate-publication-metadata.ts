import { errorIssue, type ValidationIssue, type ValidationReport } from "../../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../../validators/common/validation-result.js";
import type { PublicationMetadata } from "../entities/publication-metadata.entity.js";
import { PUBLICATION_METADATA_SCHEMA_ID } from "../../schemas/publication-metadata.schema.js";

const validatePublicationMetadataInvariants = (input: PublicationMetadata): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.category.trim().length === 0) {
    issues.push(errorIssue("CATEGORY_REQUIRED", "/category", "category is required"));
  }
  if (!Number.isInteger(input.display_priority) || input.display_priority < 0) {
    issues.push(
      errorIssue(
        "DISPLAY_PRIORITY_INVALID",
        "/display_priority",
        "display_priority must be a non-negative integer",
      ),
    );
  }
  if (input.tags.some((tag) => tag.trim().length === 0)) {
    issues.push(errorIssue("TAG_EMPTY", "/tags", "tags cannot contain empty values"));
  }
  return issues;
};

export const validatePublicationMetadata = (
  input: PublicationMetadata,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(PUBLICATION_METADATA_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validatePublicationMetadataInvariants(input);
  return buildValidationReport(
    "PublicationMetadata",
    input.category,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
