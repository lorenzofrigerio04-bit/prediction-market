import { buildValidationReport, requireSchemaValidator, resolveGeneratedAt, validateBySchema, } from "../../validators/common/validation-result.js";
import { QUEUE_ENTRY_VIEW_SCHEMA_ID } from "../schemas/queue-entry-view.schema.js";
export const validateQueueEntryView = (input, options) => {
    const schemaValidator = requireSchemaValidator(QUEUE_ENTRY_VIEW_SCHEMA_ID);
    const schemaIssues = validateBySchema(schemaValidator, input);
    return buildValidationReport("QueueEntryView", input.entry_ref, schemaIssues, resolveGeneratedAt(options));
};
//# sourceMappingURL=validate-queue-entry-view.js.map