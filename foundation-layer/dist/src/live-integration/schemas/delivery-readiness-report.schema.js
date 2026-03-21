import { ReadinessStatus } from "../enums/readiness-status.enum.js";
export const DELIVERY_READINESS_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/delivery-readiness-report.schema.json";
export const deliveryReadinessReportSchema = {
    $id: DELIVERY_READINESS_REPORT_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: [
        "id",
        "publication_package_id",
        "readiness_status",
        "blocking_issues",
        "warnings",
        "validated_at",
    ],
    properties: {
        id: { type: "string", pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        publication_package_id: { type: "string", pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$" },
        readiness_status: { type: "string", enum: Object.values(ReadinessStatus) },
        blocking_issues: { type: "array", items: { type: "string", minLength: 1 } },
        warnings: { type: "array", items: { type: "string", minLength: 1 } },
        validated_at: { type: "string", format: "date-time" },
    },
};
//# sourceMappingURL=delivery-readiness-report.schema.js.map