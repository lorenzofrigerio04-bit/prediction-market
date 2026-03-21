import { RegressionStatus } from "../enums/regression-status.enum.js";
import { ReleaseReadinessStatus } from "../enums/release-readiness-status.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { MetricUnit } from "../enums/metric-unit.enum.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";

export const PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID =
  "https://market-design-engine.dev/schemas/reliability/pipeline-health-snapshot.schema.json";

export const pipelineHealthSnapshotSchema = {
  $id: PIPELINE_HEALTH_SNAPSHOT_SCHEMA_ID,
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "id",
    "version",
    "snapshot_at",
    "covered_modules",
    "module_metrics",
    "pass_rate",
    "regression_status",
    "release_readiness_status",
    "blocking_issues",
    "warnings",
  ],
  properties: {
    id: { type: "string", pattern: "^phs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
    version: { type: "integer", minimum: 1 },
    snapshot_at: { type: "string", format: "date-time" },
    covered_modules: { type: "array", minItems: 1, items: { type: "string", enum: Object.values(TargetModule) } },
    module_metrics: { type: "array", items: { $ref: "#/$defs/moduleHealthMetric" } },
    pass_rate: { type: "number", minimum: 0, maximum: 1 },
    regression_status: { type: "string", enum: Object.values(RegressionStatus) },
    release_readiness_status: { type: "string", enum: Object.values(ReleaseReadinessStatus) },
    blocking_issues: { type: "array", items: { $ref: "#/$defs/blockingReason" } },
    warnings: { type: "array", items: { $ref: "#/$defs/warningMessage" } },
  },
  $defs: {
    moduleHealthMetric: {
      type: "object",
      additionalProperties: false,
      required: [
        "id",
        "module_name",
        "metric_name",
        "metric_value",
        "metric_unit",
        "measured_at",
        "threshold_status",
        "notes_nullable",
        "threshold_metadata_nullable",
      ],
      properties: {
        id: { type: "string", pattern: "^mhm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        module_name: { type: "string", enum: Object.values(TargetModule) },
        metric_name: { type: "string", minLength: 1 },
        metric_value: { type: "number" },
        metric_unit: { type: "string", enum: Object.values(MetricUnit) },
        measured_at: { type: "string", format: "date-time" },
        threshold_status: { type: "string", enum: Object.values(ThresholdStatus) },
        notes_nullable: { anyOf: [{ type: "null" }, { type: "string" }] },
        threshold_metadata_nullable: {
          anyOf: [
            { type: "null" },
            {
              type: "object",
              additionalProperties: false,
              required: [
                "threshold_min_nullable",
                "threshold_max_nullable",
                "threshold_target_nullable",
              ],
              properties: {
                threshold_min_nullable: { anyOf: [{ type: "null" }, { type: "number" }] },
                threshold_max_nullable: { anyOf: [{ type: "null" }, { type: "number" }] },
                threshold_target_nullable: { anyOf: [{ type: "null" }, { type: "number" }] },
              },
            },
          ],
        },
      },
    },
    blockingReason: {
      type: "object",
      additionalProperties: false,
      required: ["code", "message", "module_name", "path"],
      properties: {
        code: { type: "string", minLength: 1 },
        message: { type: "string", minLength: 1 },
        module_name: { type: "string", enum: Object.values(TargetModule) },
        path: { type: "string", minLength: 1 },
      },
    },
    warningMessage: {
      type: "object",
      additionalProperties: false,
      required: ["code", "message", "path"],
      properties: {
        code: { type: "string", minLength: 1 },
        message: { type: "string", minLength: 1 },
        path: { type: "string", minLength: 1 },
      },
    },
  },
} as const;
