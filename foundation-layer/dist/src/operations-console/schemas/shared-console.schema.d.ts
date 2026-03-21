import { ActionKey } from "../enums/action-key.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
import { PanelKey } from "../enums/panel-key.enum.js";
import { PersistedStatePolicy } from "../enums/persisted-state-policy.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { SeverityLevel } from "../enums/severity-level.enum.js";
import { SortDirection } from "../enums/sort-direction.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export declare const SHARED_CONSOLE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/shared-console.schema.json";
export declare const sharedConsoleSchema: {
    readonly $id: "https://market-design-engine.dev/schemas/operations-console/shared-console.schema.json";
    readonly $schema: "https://json-schema.org/draft/2020-12/schema";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["version"];
    readonly properties: {
        readonly version: {
            readonly type: "string";
            readonly pattern: "^v\\d+\\.\\d+\\.\\d+$";
        };
        readonly action_key: {
            readonly type: "string";
            readonly enum: ActionKey[];
        };
        readonly visibility_status: {
            readonly type: "string";
            readonly enum: VisibilityStatus[];
        };
        readonly readiness_status: {
            readonly type: "string";
            readonly enum: ReadinessStatus[];
        };
        readonly panel_key: {
            readonly type: "string";
            readonly enum: PanelKey[];
        };
        readonly filter_operator: {
            readonly type: "string";
            readonly enum: FilterOperator[];
        };
        readonly sort_direction: {
            readonly type: "string";
            readonly enum: SortDirection[];
        };
        readonly persisted_state_policy: {
            readonly type: "string";
            readonly enum: PersistedStatePolicy[];
        };
        readonly severity: {
            readonly type: "string";
            readonly enum: SeverityLevel[];
        };
    };
};
//# sourceMappingURL=shared-console.schema.d.ts.map