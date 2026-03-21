import { ActionKey } from "../enums/action-key.enum.js";
import { DecisionStatus } from "../enums/decision-status.enum.js";
import { ScopeType } from "../enums/scope-type.enum.js";
import { TargetModule } from "../enums/target-module.enum.js";
export declare const AUTHORIZATION_DECISION_SCHEMA_ID = "https://market-design-engine.dev/schemas/platform-access/authorization-decision.schema.json";
export declare const authorizationDecisionSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/platform-access/authorization-decision.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "user_id", "requested_action", "evaluated_scope", "decision_status", "matched_roles", "matched_policies", "blocking_reasons", "evaluated_at"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^adz_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly user_id: {
            readonly type: "string";
            readonly pattern: "^usr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly requested_action: {
            readonly type: "string";
            readonly enum: ActionKey[];
        };
        readonly evaluated_scope: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["scope_type", "workspace_id_nullable", "module_scope_nullable", "entity_scope_nullable", "notes_nullable"];
            readonly properties: {
                readonly scope_type: {
                    readonly type: "string";
                    readonly enum: ScopeType[];
                };
                readonly workspace_id_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly pattern: "^wsp_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    }];
                };
                readonly module_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly enum: TargetModule[];
                    }];
                };
                readonly entity_scope_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                        readonly minLength: 1;
                    }];
                };
                readonly notes_nullable: {
                    readonly anyOf: readonly [{
                        readonly type: "null";
                    }, {
                        readonly type: "string";
                    }];
                };
            };
        };
        readonly decision_status: {
            readonly type: "string";
            readonly enum: DecisionStatus[];
        };
        readonly matched_roles: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^rol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
        };
        readonly matched_policies: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly pattern: "^pol_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
            };
            readonly uniqueItems: true;
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
            readonly minLength: 1;
        };
    };
};
//# sourceMappingURL=authorization-decision.schema.d.ts.map