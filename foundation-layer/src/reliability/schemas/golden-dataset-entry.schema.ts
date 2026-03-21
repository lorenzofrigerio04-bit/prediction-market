import { DatasetScope } from "../enums/dataset-scope.enum.js";
import { PriorityLevel } from "../enums/priority-level.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";

export const GOLDEN_DATASET_ENTRY_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/reliability/golden-dataset-entry.schema.json";

export const goldenDatasetEntrySchema = {
  $id: GOLDEN_DATASET_ENTRY_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "dataset_scope",
    "input_artifact_refs",
    "expected_output_refs",
    "expected_invariants",
    "category_tags",
    "priority_level",
    "active",
  ],
  properties: {
    id: { type: "string", pattern: "^gde_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    dataset_scope: { type: "string", enum: Object.values(DatasetScope) },
    input_artifact_refs: {
      type: "array",
      items: { $ref: "#/$defs/artifactReference" },
    },
    expected_output_refs: {
      type: "array",
      items: { $ref: "#/$defs/artifactReference" },
    },
    expected_invariants: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/$defs/expectedInvariant" },
    },
    category_tags: {
      type: "array",
      items: { type: "string", minLength: 1 },
    },
    priority_level: { type: "string", enum: Object.values(PriorityLevel) },
    active: { type: "boolean" },
  },
  $defs: {
    artifactReference: {
      type: "object",
      additionalProperties: false,
      required: [
        "module_name",
        "artifact_type",
        "artifact_id",
        "artifact_version_nullable",
        "uri_nullable",
      ],
      properties: {
        module_name: { type: "string", enum: Object.values(TargetModule) },
        artifact_type: { type: "string", minLength: 1 },
        artifact_id: { type: "string", minLength: 1 },
        artifact_version_nullable: { anyOf: [{ type: "null" }, { type: "integer", minimum: 1 }] },
        uri_nullable: { anyOf: [{ type: "null" }, { type: "string", minLength: 1 }] },
      },
    },
    expectedInvariant: {
      type: "object",
      additionalProperties: false,
      required: ["code", "description", "path"],
      properties: {
        code: { type: "string", minLength: 1 },
        description: { type: "string", minLength: 1 },
        path: { type: "string", minLength: 1 },
      },
    },
  },
} as const;
