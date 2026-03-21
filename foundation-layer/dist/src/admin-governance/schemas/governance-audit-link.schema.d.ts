import { AuditLinkType } from "../enums/audit-link-type.enum.js";
export declare const GOVERNANCE_AUDIT_LINK_SCHEMA_ID = "https://market-design-engine.dev/schemas/admin-governance/governance-audit-link.schema.json";
export declare const governanceAuditLinkSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-audit-link.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "audit_ref", "link_type", "decision_ref_nullable", "override_ref_nullable", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^aga_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly link_type: {
            readonly type: "string";
            readonly enum: AuditLinkType[];
        };
        readonly decision_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^agd_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly override_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
};
//# sourceMappingURL=governance-audit-link.schema.d.ts.map