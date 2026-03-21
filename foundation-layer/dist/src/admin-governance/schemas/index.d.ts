export declare const adminGovernanceSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/admin-feature-flag.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "flag_key", "module_id", "source_id_nullable", "default_state", "enabled", "safety_level", "owner_ref", "audit_ref", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agf_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly flag_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly source_id_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly pattern: "^ags_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            }];
        };
        readonly default_state: {
            readonly type: "string";
            readonly enum: import("../index.js").DefaultState[];
        };
        readonly enabled: {
            readonly type: "boolean";
        };
        readonly safety_level: {
            readonly type: "string";
            readonly enum: import("../index.js").SafetyControlLevel[];
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-module.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "status", "supported_operations", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").GovernanceModuleStatus[];
        };
        readonly supported_operations: {
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
}, {
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
            readonly enum: import("../index.js").GovernanceSourceType[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/guardrail-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "operation_key", "severity", "deny_by_default", "active", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").GuardrailSeverity[];
        };
        readonly deny_by_default: {
            readonly type: "boolean";
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/emergency-control.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "state", "reason", "activated_by", "activated_at", "expires_at_nullable", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^age_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly state: {
            readonly type: "string";
            readonly enum: import("../index.js").EmergencyState[];
        };
        readonly reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly activated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly activated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expires_at_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly format: "date-time";
            }];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/override-request.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "operation_key", "requested_by", "reason", "status", "requested_at", "expires_at_nullable", "resolved_by_nullable", "audit_ref", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^ago_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly operation_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").OverrideStatus[];
        };
        readonly requested_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expires_at_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly format: "date-time";
            }];
        };
        readonly resolved_by_nullable: {
            readonly anyOf: readonly [{
                readonly type: "null";
            }, {
                readonly type: "string";
                readonly minLength: 1;
            }];
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-environment-binding.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_id", "environment_key", "environment_tier", "status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agev_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_id: {
            readonly type: "string";
            readonly pattern: "^agm_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly environment_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly environment_tier: {
            readonly type: "string";
            readonly enum: import("../index.js").EnvironmentTier[];
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").EnvironmentStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
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
            readonly enum: import("../index.js").AdminGovernanceDecisionStatus[];
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
}, {
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
            readonly enum: import("../index.js").AuditLinkType[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/admin-governance-compatibility-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "requested_operations", "allowed_operations", "denied_operations", "lossy_fields", "status", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly allowed_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly lossy_fields: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").CompatibilityStatus[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/governance-compatibility-result.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "module_key", "allowed_operations", "denied_operations", "status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^agc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly allowed_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly status: {
            readonly type: "string";
            readonly enum: import("../index.js").CompatibilityStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/platform-access-governance-context.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["module_key", "requested_operations", "denied_operations"];
    readonly properties: {
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly requested_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/operations-console-governance-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["module_key", "visible_operations"];
    readonly properties: {
        readonly module_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly visible_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/editorial-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/publication-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/reliability-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/admin-governance/virtual-credits-governance-guard.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["denied_operations"];
    readonly properties: {
        readonly denied_operations: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}];
export * from "./admin-feature-flag.schema.js";
export * from "./admin-governance-compatibility-view.schema.js";
export * from "./admin-safety-decision.schema.js";
export * from "./editorial-governance-guard.schema.js";
export * from "./emergency-control.schema.js";
export * from "./emergency-stop.schema.js";
export * from "./environment-control-state.schema.js";
export * from "./feature-flag.schema.js";
export * from "./generation-guardrail.schema.js";
export * from "./governance-audit-link.schema.js";
export * from "./governance-compatibility-view.schema.js";
export * from "./governance-compatibility-result.schema.js";
export * from "./governance-decision.schema.js";
export * from "./governance-environment-binding.schema.js";
export * from "./governance-module.schema.js";
export * from "./governance-source.schema.js";
export * from "./guardrail-policy.schema.js";
export * from "./module-control.schema.js";
export * from "./operations-console-governance-view.schema.js";
export * from "./override-request.schema.js";
export * from "./platform-access-governance-context.schema.js";
export * from "./policy-override.schema.js";
export * from "./publication-governance-guard.schema.js";
export * from "./reliability-governance-guard.schema.js";
export * from "./source-enablement-control.schema.js";
export * from "./virtual-credits-governance-guard.schema.js";
//# sourceMappingURL=index.d.ts.map