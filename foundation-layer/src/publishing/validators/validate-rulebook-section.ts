import { type ValidationIssue, type ValidationReport, errorIssue } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { RulebookSection } from "../rulebook/entities/rulebook-section.entity.js";
import { RULEBOOK_SECTION_SCHEMA_ID } from "../schemas/rulebook-section.schema.js";

const validateRulebookSectionInvariants = (input: RulebookSection): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.title.trim().length === 0) {
    issues.push(errorIssue("EMPTY_RULEBOOK_SECTION_TITLE", "/title", "title must be non-empty"));
  }
  if (input.body.trim().length === 0) {
    issues.push(errorIssue("EMPTY_RULEBOOK_SECTION_BODY", "/body", "body must be non-empty"));
  }
  return issues;
};

export const validateRulebookSection = (
  input: RulebookSection,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(RULEBOOK_SECTION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateRulebookSectionInvariants(input)];
  return buildValidationReport("RulebookSection", input.id, issues, resolveGeneratedAt(options));
};
