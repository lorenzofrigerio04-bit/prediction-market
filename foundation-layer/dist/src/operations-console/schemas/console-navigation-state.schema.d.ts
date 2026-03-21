import { PanelKey } from "../enums/panel-key.enum.js";
import { PersistedStatePolicy } from "../enums/persisted-state-policy.enum.js";
import { ViewScope } from "../enums/view-scope.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
export declare const CONSOLE_NAVIGATION_STATE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/console-navigation-state.schema.json";
export declare const consoleNavigationStateSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/console-navigation-state.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "active_panel", "active_filters", "selected_entity_ref_nullable", "breadcrumb_state", "user_scope", "persisted_state_policy"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^cns_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly active_panel: {
            readonly type: "string";
            readonly enum: PanelKey[];
        };
        readonly active_filters: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["filters"];
            readonly properties: {
                readonly filters: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["field", "operator", "value"];
                        readonly properties: {
                            readonly field: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly operator: {
                                readonly type: "string";
                                readonly enum: FilterOperator[];
                            };
                            readonly value: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                        };
                    };
                };
            };
        };
        readonly selected_entity_ref_nullable: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly minLength: 1;
            }, {
                readonly type: "null";
            }];
        };
        readonly breadcrumb_state: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["items"];
            readonly properties: {
                readonly items: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly user_scope: {
            readonly type: "string";
            readonly enum: ViewScope[];
        };
        readonly persisted_state_policy: {
            readonly type: "string";
            readonly enum: PersistedStatePolicy[];
        };
    };
};
//# sourceMappingURL=console-navigation-state.schema.d.ts.map