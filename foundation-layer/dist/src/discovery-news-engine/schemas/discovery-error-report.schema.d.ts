import { DiscoveryErrorCode } from "../enums/discovery-error-code.enum.js";
export declare const DISCOVERY_ERROR_REPORT_SCHEMA_ID = "https://market-design-engine.dev/schemas/discovery/discovery-error-report.schema.json";
export declare const discoveryErrorReportSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/discovery/discovery-error-report.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["runId", "code", "message", "failures", "timestamp"];
    readonly properties: {
        readonly runId: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/discoveryRunId";
        };
        readonly code: {
            readonly type: "string";
            readonly enum: DiscoveryErrorCode[];
        };
        readonly message: {
            readonly type: "string";
        };
        readonly failures: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "https://market-design-engine.dev/schemas/discovery/discovery-validation-failure.schema.json";
            };
        };
        readonly timestamp: {
            readonly $ref: "https://market-design-engine.dev/schemas/common/primitives.schema.json#/$defs/isoTimestamp";
        };
    };
};
//# sourceMappingURL=discovery-error-report.schema.d.ts.map