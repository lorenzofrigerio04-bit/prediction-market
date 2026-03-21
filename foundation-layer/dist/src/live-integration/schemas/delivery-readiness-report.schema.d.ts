import { ReadinessStatus } from "../enums/readiness-status.enum.js";
export declare const DELIVERY_READINESS_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/live-integration/delivery-readiness-report.schema.json";
export declare const deliveryReadinessReportSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/live-integration/delivery-readiness-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "publication_package_id", "readiness_status", "blocking_issues", "warnings", "validated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^drrp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly publication_package_id: {
            readonly type: "string";
            readonly pattern: "^ppkg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: ReadinessStatus[];
        };
        readonly blocking_issues: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly warnings: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly validated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
};
//# sourceMappingURL=delivery-readiness-report.schema.d.ts.map