import { RiskSeverity } from "../enums/risk-severity.enum.js";
import { RiskType } from "../enums/risk-type.enum.js";
export declare const ABUSE_RISK_FLAG_SCHEMA_ID = "https://market-design-engine.dev/schemas/virtual-credits/abuse-risk-flag.schema.json";
export declare const abuseRiskFlagSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/abuse-risk-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_owner_ref", "risk_type", "severity", "detected_at", "related_refs", "active", "mitigation_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^var_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly risk_type: {
            readonly type: "string";
            readonly enum: RiskType[];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: RiskSeverity[];
        };
        readonly detected_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly related_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly mitigation_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
};
//# sourceMappingURL=abuse-risk-flag.schema.d.ts.map