import { errorIssue, type ValidationIssue, type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import { EntryType } from "../enums/entry-type.enum.js";
import { QueueScope } from "../enums/queue-scope.enum.js";
import type { QueuePanelView } from "../queues/entities/queue-panel-view.entity.js";
import { QUEUE_PANEL_VIEW_SCHEMA_ID } from "../schemas/queue-panel-view.schema.js";

const scopeEntryTypeMap: Readonly<Record<QueueScope, EntryType>> = {
  [QueueScope.CANDIDATES]: EntryType.CANDIDATE,
  [QueueScope.REVIEWS]: EntryType.REVIEW,
  [QueueScope.PUBLICATION]: EntryType.PUBLICATION,
  [QueueScope.RELIABILITY]: EntryType.RELIABILITY_SIGNAL,
};

const validateQueuePanelInvariants = (input: QueuePanelView): readonly ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.panel_key === undefined || input.panel_key === null) {
    issues.push(errorIssue("QUEUE_PANEL_KEY_REQUIRED", "/panel_key", "panel_key is required"));
  }
  const expectedEntryType = scopeEntryTypeMap[input.queue_scope];
  for (const [index, entry] of input.entries.entries()) {
    if (entry.entry_type !== expectedEntryType) {
      issues.push(
        errorIssue(
          "QUEUE_SCOPE_ENTRY_TYPE_MISMATCH",
          `/entries/${index}/entry_type`,
          `entry_type ${entry.entry_type} is not coherent with queue_scope ${input.queue_scope}`,
        ),
      );
    }
  }
  const refs = input.entries.map((entry) => entry.entry_ref);
  if (new Set(refs).size !== refs.length) {
    issues.push(errorIssue("QUEUE_ENTRY_REF_DUPLICATE", "/entries", "entries must have unique entry_ref"));
  }
  return issues;
};

export const validateQueuePanelView = (input: QueuePanelView, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(QUEUE_PANEL_VIEW_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  const invariantIssues = validateQueuePanelInvariants(input);
  return buildValidationReport(
    "QueuePanelView",
    input.id,
    [...schemaIssues, ...invariantIssues],
    resolveGeneratedAt(options),
  );
};
