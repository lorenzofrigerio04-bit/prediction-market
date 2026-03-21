import { ReportScope } from "../enums/report-scope.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
import { MetricUnit } from "../enums/metric-unit.enum.js";
import { ThresholdStatus } from "../enums/threshold-status.enum.js";
export const QUALITY_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/reliability/quality-report.schema.json";
export const qualityReportSchema = {
    $id: QUALITY_REPORT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "version",
        "report_scope",
        "generated_at",
        "summary",
        "key_findings",
        "metrics_summary",
        "unresolved_issues",
        "recommendations",
    ],
    properties: {
        id: { type: "string", pattern: "^qrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        version: { type: "integer", minimum: 1 },
        report_scope: { type: "string", enum: Object.values(ReportScope) },
        generated_at: { type: "string", format: "date-time" },
        summary: { type: "string", minLength: 1 },
        key_findings: { type: "array", items: { type: "string", minLength: 1 } },
        metrics_summary: { type: "array", items: { $ref: "#/$defs/moduleHealthMetric" } },
        unresolved_issues: { type: "array", items: { $ref: "#/$defs/blockingReason" } },
        recommendations: { type: "array", items: { type: "string", minLength: 1 } },
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
    },
};
//# sourceMappingURL=quality-report.schema.js.map