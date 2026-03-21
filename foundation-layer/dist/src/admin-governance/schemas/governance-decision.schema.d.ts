import { GovernanceDecisionStatus } from "../enums/governance-decision-status.enum.js";
export declare const GOVERNANCE_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-decision.schema.json";
export declare const governanceDecisionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_id", "operation_key", "status", "decided_by", "decided_at", "audit_ref", "reasons", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: GovernanceDecisionStatus[];
        };
        readonly decided_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly decided_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=governance-decision.schema.d.ts.map