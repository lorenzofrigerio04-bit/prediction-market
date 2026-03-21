import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { QueueEntryView } from "../queues/entities/queue-entry-view.entity.js";
import { QUEUE_ENTRY_VIEW_SCHEMA_ID } from "../schemas/queue-entry-view.schema.js";

export const validateQueueEntryView = (input: QueueEntryView, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(QUEUE_ENTRY_VIEW_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("QueueEntryView", input.entry_ref, schemaIssues, resolveGeneratedAt(options));
};
