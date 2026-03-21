import { EVENT_SIGNAL_SCHEMA_ID } from "../schemas/entities/event-signal.schema.js";
import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "./common/validation-result.js";
import { validateEventSignalInvariants } from "./domain-invariants.validator.js";
export const validateEventSignal = (input, options) => {
    const schemaValidator = requireSchemaValidator(EVENT_SIGNAL_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    const issues = [...schemaIssues, ...validateEventSignalInvariants(input)];
    return buildValidationReport("EventSignal", input.id, issues, resolveGeneratedAt(options));
};
//# sourceMappingURL=event-signal.validator.js.map