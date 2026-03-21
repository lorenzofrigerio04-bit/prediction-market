import { ArtifactType } from "../enums/artifact-type.enum.js";

export const ARTIFACT_INSPECTION_VIEW_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/operations-console/artifact-inspection-view.schema.json";

export const artifactInspectionViewSchema = {
  $id: ARTIFACT_INSPECTION_VIEW_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "artifact_ref",
    "artifact_type",
    "structured_fields",
    "validation_snapshot",
    "compatibility_snapshot",
    "related_refs",
  ],
  properties: {
    id: { type: "string", pattern: "^aiv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
    artifact_ref: { type: "string", pattern: "^arf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    artifact_type: { type: "string", enum: Object.values(ArtifactType) },
    structured_fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "value_type", "value_summary"],
        properties: {
          key: { type: "string", minLength: 1 },
          value_type: { type: "string", minLength: 1 },
          value_summary: { type: "string", minLength: 1 },
        },
      },
    },
    validation_snapshot: {
      type: "object",
      additionalProperties: false,
      required: ["is_valid", "issue_count", "blocking_issue_count"],
      properties: {
        is_valid: { type: "boolean" },
        issue_count: { type: "integer", minimum: 0 },
        blocking_issue_count: { type: "integer", minimum: 0 },
      },
    },
    compatibility_snapshot: {
      type: "object",
      additionalProperties: false,
      required: ["is_compatible", "incompatible_with", "lossy_fields"],
      properties: {
        is_compatible: { type: "boolean" },
        incompatible_with: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
        lossy_fields: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
      },
    },
    related_refs: { type: "array", items: { type: "string", minLength: 1 }, uniqueItems: true },
  },
} as const;
