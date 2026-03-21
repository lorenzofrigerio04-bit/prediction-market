import {
  errorIssue,
  type ValidationIssue,
  type ValidationReport,
} from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { SourceRegistryEntry } from "../entities/source-registry-entry.entity.js";
import { SOURCE_REGISTRY_ENTRY_SCHEMA_ID } from "../schemas/source-registry-entry.schema.js";

const validateSourceRegistryEntryInvariants = (
  input: SourceRegistryEntry,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.ownerNotesNullable !== null && input.ownerNotesNullable.trim().length === 0) {
    issues.push(
      errorIssue(
        "INVALID_SOURCE_REGISTRY_ENTRY",
        "/ownerNotesNullable",
        "ownerNotesNullable cannot be empty when provided",
      ),
    );
  }
  return issues;
};

export const validateSourceRegistryEntry = (
  input: SourceRegistryEntry,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(SOURCE_REGISTRY_ENTRY_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateSourceRegistryEntryInvariants(input)];
  return buildValidationReport("SourceRegistryEntry", input.sourceDefinitionId, issues, resolveGeneratedAt(options));
};
