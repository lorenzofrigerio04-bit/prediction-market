import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { RULEBOOK_SECTION_SCHEMA_ID } from "../schemas/rulebook-section.schema.js";
const validateRulebookSectionInvariants = (input) => {
    const issues = [];
    if (input.title.trim().length === 0) {
        issues.push(errorIssue("EMPTY_RULEBOOK_SECTION_TITLE", "/title", "title must be non-empty"));
    }
    if (input.body.trim().length === 0) {
        issues.push(errorIssue("EMPTY_RULEBOOK_SECTION_BODY", "/body", "body must be non-empty"));
    }
    return issues;
};
export const validateRulebookSection = (input, options) => {
    const schemaValidator = requireSchemaValidator(RULEBOOK_SECTION_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateRulebookSectionInvariants(input)];
    return buildValidationReport("RulebookSection", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-rulebook-section.js.map