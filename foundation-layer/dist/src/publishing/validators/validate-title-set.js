import { errorIssue } from "../../entities/validation-report.entity.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { TITLE_SET_SCHEMA_ID } from "../schemas/title-set.schema.js";
import { isCanonicalMoreFormalThanDisplay, isDisplayTitleCompatible, } from "../titles/title-invariants.js";
const validateTitleSetInvariants = (input) => {
    const issues = [];
    if (input.canonical_title.trim().length === 0) {
        issues.push(errorIssue("EMPTY_CANONICAL_TITLE", "/canonical_title", "canonical_title must be non-empty"));
    }
    if (input.display_title.trim().length === 0) {
        issues.push(errorIssue("EMPTY_DISPLAY_TITLE", "/display_title", "display_title must be non-empty"));
    }
    if (input.canonical_title.trim().length > 0 &&
        input.display_title.trim().length > 0 &&
        !isCanonicalMoreFormalThanDisplay(input.canonical_title, input.display_title)) {
        issues.push(errorIssue("CANONICAL_TITLE_NOT_FORMAL_ENOUGH", "/canonical_title", "canonical_title must be at least as formal as display_title"));
    }
    if (input.canonical_title.trim().length > 0 &&
        input.display_title.trim().length > 0 &&
        !isDisplayTitleCompatible(input.canonical_title, input.display_title)) {
        issues.push(errorIssue("DISPLAY_TITLE_NOT_COMPATIBLE", "/display_title", "display_title must be a presentational variant of canonical_title without contradiction"));
    }
    if (input.subtitle !== null && /\b(if and only if|unless|only if|provided that)\b/i.test(input.subtitle)) {
        issues.push(errorIssue("SUBTITLE_INTRODUCES_CONDITIONS", "/subtitle", "subtitle must not introduce contractual conditions"));
    }
    return issues;
};
export const validateTitleSet = (input, options) => {
    const schemaValidator = requireSchemaValidator(TITLE_SET_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateTitleSetInvariants(input)];
    return buildValidationReport("TitleSet", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-title-set.js.map