import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { ViewScope } from "../enums/view-scope.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
import { SortDirection } from "../enums/sort-direction.enum.js";
export declare const CANDIDATE_LIST_VIEW_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/candidate-list-view.schema.json";
export declare const candidateListViewSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/candidate-list-view.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "version", "view_scope", "candidate_entries", "aggregate_counts", "applied_filters", "sort_config"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly pattern: "^clv_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly view_scope: {
            readonly type: "string";
            readonly enum: ViewScope[];
        };
        readonly candidate_entries: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["candidate_ref", "title", "readiness_status", "warnings_count"];
                readonly properties: {
                    readonly candidate_ref: {
                        readonly type: "string";
                        readonly pattern: "^cdr_[a-zA-Z0-9][a-zA-Z0-9_-]{5,63}$";
                    };
                    readonly title: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly readiness_status: {
                        readonly type: "string";
                        readonly enum: ReadinessStatus[];
                    };
                    readonly warnings_count: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
        readonly aggregate_counts: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "integer";
                readonly minimum: 0;
            };
        };
        readonly applied_filters: {
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
        readonly sort_config: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["sort_field", "sort_direction"];
            readonly properties: {
                readonly sort_field: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly sort_direction: {
                    readonly type: "string";
                    readonly enum: SortDirection[];
                };
            };
        };
    };
};
//# sourceMappingURL=candidate-list-view.schema.d.ts.map