import { GovernanceSourceType } from "../enums/governance-source-type.enum.js";
export declare const GOVERNANCE_SOURCE_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-source.schema.json";
export declare const governanceSourceSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-source.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "source_key", "source_type", "trust_weight", "active", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly source_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly source_type: {
            readonly type: "string";
            readonly enum: GovernanceSourceType[];
        };
        readonly trust_weight: {
            readonly type: "number";
        };
        readonly active: {
            readonly type: "boolean";
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=governance-source.schema.d.ts.map