import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { AuditTimelineItem } from "../audit/entities/audit-timeline-item.entity.js";
import { AUDIT_TIMELINE_ITEM_SCHEMA_ID } from "../schemas/audit-timeline-item.schema.js";

export const validateAuditTimelineItem = (
  input: AuditTimelineItem,
  options?: ValidationOptions,
): ValidationReport => {
  const schemaValidator = requireSchemaValidator(AUDIT_TIMELINE_ITEM_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("AuditTimelineItem", input.item_ref, schemaIssues, resolveGeneratedAt(options));
};
