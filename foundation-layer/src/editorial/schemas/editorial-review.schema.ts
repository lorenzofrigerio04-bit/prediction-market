import { ReviewStatus } from "../enums/review-status.enum.js";
import { ReasonCode } from "../enums/reason-code.enum.js";
import { FINDING_SEVERITIES } from "../value-objects/severity-summary.vo.js";

export const EDITORIAL_REVIEW_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/editorial/editorial-review.schema.json";

export const editorialReviewSchema = {
  $id: EDITORIAL_REVIEW_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "publishable_candidate_id",
    "review_status",
    "reviewer_id",
    "reviewed_at",
    "findings",
    "required_actions",
    "review_notes_nullable",
    "severity_summary",
  ],
  properties: {
    id: { type: "string", pattern: "^edrev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    publishable_candidate_id: { type: "string", pattern: "^pcnd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    review_status: { type: "string", enum: Object.values(ReviewStatus) },
    reviewer_id: { type: "string", pattern: "^actor_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    reviewed_at: { type: "string", format: "date-time" },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "severity", "message", "path"],
        properties: {
          code: { type: "string", enum: Object.values(ReasonCode) },
          severity: { type: "string", enum: [...FINDING_SEVERITIES] },
          message: { type: "string", minLength: 1 },
          path: { type: "string", minLength: 1 },
        },
      },
    },
    required_actions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["code", "description", "owner", "is_mandatory"],
        properties: {
          code: { type: "string", enum: Object.values(ReasonCode) },
          description: { type: "string", minLength: 1 },
          owner: { type: "string", minLength: 1 },
          is_mandatory: { type: "boolean" },
        },
      },
    },
    review_notes_nullable: { anyOf: [{ type: "string" }, { type: "null" }] },
    severity_summary: {
      type: "object",
      additionalProperties: false,
      required: ["low", "medium", "high", "critical", "highest_severity", "total_findings"],
      properties: {
        low: { type: "integer", minimum: 0 },
        medium: { type: "integer", minimum: 0 },
        high: { type: "integer", minimum: 0 },
        critical: { type: "integer", minimum: 0 },
        highest_severity: { type: "string", enum: [...FINDING_SEVERITIES] },
        total_findings: { type: "integer", minimum: 0 },
      },
    },
  },
} as const;
