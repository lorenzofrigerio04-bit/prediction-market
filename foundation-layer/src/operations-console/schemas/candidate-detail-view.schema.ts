import { ActionKey } from "../enums/action-key.enum.js";
import { ArtifactType } from "../enums/artifact-type.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";

export const CANDIDATE_DETAIL_VIEW_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/operations-console/candidate-detail-view.schema.json";

export const candidateDetailViewSchema = {
  $id: CANDIDATE_DETAIL_VIEW_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "candidate_ref",
    "artifact_sections",
    "readiness_snapshot",
    "linked_audit_refs",
    "linked_review_refs",
    "linked_publication_refs",
    "visible_actions",
    "visibility_status",
  ],
  properties: {
    id: { type: "string", pattern: "^cdv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    candidate_ref: { type: "string", pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    artifact_sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["artifact_ref", "artifact_type", "section_title", "field_count"],
        properties: {
          artifact_ref: { type: "string", pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
          artifact_type: { type: "string", enum: Object.values(ArtifactType) },
          section_title: { type: "string", minLength: 1 },
          field_count: { type: "integer", minimum: 0 },
        },
      },
    },
    readiness_snapshot: {
      type: "object",
      additionalProperties: false,
      required: ["readiness_status", "blocking_issues", "warnings"],
      properties: {
        readiness_status: { type: "string", enum: Object.values(ReadinessStatus) },
        blocking_issues: { type: "array", items: { type: "string", minLength: 1 } },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
      },
    },
    linked_audit_refs: { type: "array", items: { type: "string", pattern: "^aud_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }, uniqueItems: true },
    linked_review_refs: { type: "array", items: { type: "string", pattern: "^rev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }, uniqueItems: true },
    linked_publication_refs: { type: "array", items: { type: "string", pattern: "^pub_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" }, uniqueItems: true },
    visible_actions: { type: "array", items: { type: "string", enum: Object.values(ActionKey) }, uniqueItems: true },
    visibility_status: { type: "string", enum: Object.values(VisibilityStatus) },
  },
} as const;
