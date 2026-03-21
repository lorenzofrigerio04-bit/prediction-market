export declare const virtualCreditSchemas: readonly [{
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/virtual-credit-account.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "owner_type", "owner_ref", "account_status", "currency_key", "current_balance_nullable", "overdraft_policy", "metadata"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly owner_type: {
            readonly type: "string";
            readonly enum: import("../index.js").OwnerType[];
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly account_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AccountStatus[];
        };
        readonly currency_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly current_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly overdraft_policy: {
            readonly type: "string";
            readonly enum: import("../index.js").OverdraftPolicy[];
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-grant.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_account_id", "grant_type", "amount", "issued_by", "issued_at", "expiration_nullable", "grant_reason", "grant_status", "source_policy_ref_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcg_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly grant_type: {
            readonly type: "string";
            readonly enum: import("../index.js").GrantType[];
        };
        readonly amount: {
            readonly type: "number";
        };
        readonly issued_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly issued_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly expiration_nullable: {
            readonly type: readonly ["string", "null"];
            readonly format: "date-time";
        };
        readonly grant_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grant_status: {
            readonly type: "string";
            readonly enum: import("../index.js").GrantStatus[];
        };
        readonly source_policy_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-ledger-entry.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "entry_type", "amount_delta", "resulting_balance_nullable", "correlation_id", "caused_by_ref", "created_at", "immutable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly entry_type: {
            readonly type: "string";
            readonly enum: import("../index.js").LedgerEntryType[];
        };
        readonly amount_delta: {
            readonly type: "number";
        };
        readonly resulting_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly correlation_id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly caused_by_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly created_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly immutable: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-consumption-event.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "action_key", "consumption_amount", "consumed_at", "related_entity_ref_nullable", "quota_evaluation_ref_nullable", "consumption_status", "notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vce_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly consumption_amount: {
            readonly type: "number";
        };
        readonly consumed_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly related_entity_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly quota_evaluation_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly consumption_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConsumptionStatus[];
        };
        readonly notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credit-balance-snapshot.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "account_id", "snapshot_balance", "snapshot_at", "included_ledger_refs", "consistency_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vcs_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly snapshot_balance: {
            readonly type: "number";
        };
        readonly snapshot_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly included_ledger_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^vcl_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
        };
        readonly consistency_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConsistencyStatus[];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/quota-policy.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_key", "target_scope", "quota_type", "max_amount", "window_definition", "enforcement_mode", "active"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly target_scope: {
            readonly type: "string";
            readonly enum: import("../index.js").AccountOwnerScope[];
        };
        readonly quota_type: {
            readonly type: "string";
            readonly enum: import("../index.js").QuotaType[];
        };
        readonly max_amount: {
            readonly type: "number";
        };
        readonly window_definition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["unit", "size"];
            readonly properties: {
                readonly unit: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MeasurementWindowUnit[];
                };
                readonly size: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly enforcement_mode: {
            readonly type: "string";
            readonly enum: import("../index.js").EnforcementMode[];
        };
        readonly active: {
            readonly type: "boolean";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/quota-evaluation.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "policy_id", "target_account_id", "evaluated_action_key", "current_usage", "requested_usage", "decision_status", "blocking_reasons", "evaluated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vqe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly policy_id: {
            readonly type: "string";
            readonly pattern: "^vqp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly evaluated_action_key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly current_usage: {
            readonly type: "number";
        };
        readonly requested_usage: {
            readonly type: "number";
        };
        readonly decision_status: {
            readonly type: "string";
            readonly enum: import("../index.js").QuotaDecisionStatus[];
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/usage-counter.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "owner_ref", "counter_type", "measured_value", "measurement_window", "updated_at", "consistency_notes_nullable"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vuc_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly counter_type: {
            readonly type: "string";
            readonly enum: import("../index.js").CounterType[];
        };
        readonly measured_value: {
            readonly type: "number";
        };
        readonly measurement_window: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["unit", "size"];
            readonly properties: {
                readonly unit: {
                    readonly type: "string";
                    readonly enum: import("../index.js").MeasurementWindowUnit[];
                };
                readonly size: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly updated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly consistency_notes_nullable: {
            readonly type: readonly ["string", "null"];
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/bonus-eligibility.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_owner_ref", "bonus_type", "eligibility_status", "evaluated_at", "blocking_reasons", "supporting_refs"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vbe_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly bonus_type: {
            readonly type: "string";
            readonly enum: import("../index.js").BonusType[];
        };
        readonly eligibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").EligibilityStatus[];
        };
        readonly evaluated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly blocking_reasons: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly supporting_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/admin-credit-adjustment.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "target_account_id", "adjustment_type", "amount_delta", "initiated_by", "initiated_at", "adjustment_reason", "audit_ref", "applied_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^vaa_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly target_account_id: {
            readonly type: "string";
            readonly pattern: "^vca_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly adjustment_type: {
            readonly type: "string";
            readonly enum: import("../index.js").AdjustmentType[];
        };
        readonly amount_delta: {
            readonly type: "number";
        };
        readonly initiated_by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly initiated_at: {
            readonly type: "string";
            readonly format: "date-time";
        };
        readonly adjustment_reason: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly audit_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly applied_status: {
            readonly type: "string";
            readonly enum: import("../index.js").AppliedStatus[];
        };
    };
}, {
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
            readonly enum: import("../index.js").RiskType[];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: import("../index.js").RiskSeverity[];
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
}, {
    readonly $id: "https://market-design-engine.dev/schemas/virtual-credits/credits-compatibility-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "owner_ref", "access_scope_ref", "account_ref_nullable", "visible_balance_nullable", "active_quota_refs", "active_risk_flags", "allowed_actions", "warnings", "compatibility_status"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly owner_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly access_scope_ref: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly account_ref_nullable: {
            readonly type: readonly ["string", "null"];
        };
        readonly visible_balance_nullable: {
            readonly type: readonly ["number", "null"];
        };
        readonly active_quota_refs: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly active_risk_flags: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly allowed_actions: {
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
        readonly compatibility_status: {
            readonly type: "string";
            readonly enum: import("../index.js").ConsistencyStatus[];
        };
    };
}];
export * from "./virtual-credit-account.schema.js";
export * from "./credit-grant.schema.js";
export * from "./credit-ledger-entry.schema.js";
export * from "./credit-consumption-event.schema.js";
export * from "./credit-balance-snapshot.schema.js";
export * from "./quota-policy.schema.js";
export * from "./quota-evaluation.schema.js";
export * from "./usage-counter.schema.js";
export * from "./bonus-eligibility.schema.js";
export * from "./admin-credit-adjustment.schema.js";
export * from "./abuse-risk-flag.schema.js";
export * from "./credits-compatibility-view.schema.js";
//# sourceMappingURL=index.d.ts.map