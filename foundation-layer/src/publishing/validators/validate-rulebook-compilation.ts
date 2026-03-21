import { type ValidationIssue, type ValidationReport, errorIssue } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import {
  REQUIRED_RULEBOOK_SECTION_TYPES,
  type RulebookCompilation,
} from "../rulebook/entities/rulebook-compilation.entity.js";
import { RULEBOOK_COMPILATION_SCHEMA_ID } from "../schemas/rulebook-compilation.schema.js";

const validateRulebookCompilationInvariants = (
  input: RulebookCompilation,
): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const sectionTypes = input.included_sections.map((section) => section.section_type);
  for (const requiredType of REQUIRED_RULEBOOK_SECTION_TYPES) {
    if (!sectionTypes.includes(requiredType)) {
      issues.push(
        errorIssue(
          "MISSING_REQUIRED_RULEBOOK_SECTION",
          "/included_sections",
          `Missing required section type: ${requiredType}`,
        ),
      );
    }
  }
  const dedupKey = input.included_sections.map((section) => section.section_type).join("|");
  if (new Set(input.included_sections.map((section) => section.section_type)).size !== input.included_sections.length) {
    issues.push(
      errorIssue(
        "DUPLICATE_RULEBOOK_SECTION_TYPE",
        "/included_sections",
        "included_sections must not contain duplicate section types",
        { dedupKey },
      ),
    );
  }
  return issues;
};

export const validateRulebookCompilation = (
  input: RulebookCompilation,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(RULEBOOK_COMPILATION_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const issues = [...schemaIssues, ...validateRulebookCompilationInvariants(input)];
  return buildValidationReport("RulebookCompilation", input.id, issues, resolveGeneratedAt(options));
};
