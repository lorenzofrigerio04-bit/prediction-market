import { CANONICAL_EVENT_SCHEMA_ID } from "../schemas/entities/canonical-event.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
import { validateCanonicalEventInvariants } from "./domain-invariants.validator.js";
export const validateCanonicalEvent = (input, options) => {
    const schemaValidator = requireSchemaValidator(CANONICAL_EVENT_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateCanonicalEventInvariants(input)];
    return buildValidationReport("CanonicalEvent", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=canonical-event.validator.js.map