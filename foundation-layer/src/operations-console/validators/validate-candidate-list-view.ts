import { type ValidationReport } from "../../entities/validation-report.entity.js";
import {
  buildValidationReport,
  requireSchemaValidator,
  resolveGeneratedAt,
  type ValidationOptions,
  validateBySchema,
} from "../../validators/common/validation-result.js";
import type { CandidateListView } from "../candidates/entities/candidate-list-view.entity.js";
import { CANDIDATE_LIST_VIEW_SCHEMA_ID } from "../schemas/candidate-list-view.schema.js";

export const validateCandidateListView = (input: CandidateListView, options?: ValidationOptions): ValidationReport => {
  const schemaValidator = requireSchemaValidator(CANDIDATE_LIST_VIEW_SCHEMA_ID);
  const schemaIssues = validateBySchema(schemaValidator, input);
  return buildValidationReport("CandidateListView", input.id, schemaIssues, resolveGeneratedAt(options));
};
