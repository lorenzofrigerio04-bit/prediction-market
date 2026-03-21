import { ActionKey } from "../enums/action-key.enum.js";
import { FilterOperator } from "../enums/filter-operator.enum.js";
import { PanelKey } from "../enums/panel-key.enum.js";
import { PersistedStatePolicy } from "../enums/persisted-state-policy.enum.js";
import { ReadinessStatus } from "../enums/readiness-status.enum.js";
import { SeverityLevel } from "../enums/severity-level.enum.js";
import { SortDirection } from "../enums/sort-direction.enum.js";
import { VisibilityStatus } from "../enums/visibility-status.enum.js";
export const SHARED_CONSOLE_SCHEMA_ID = "https://market-design-engine.dev/schemas/operations-console/shared-console.schema.json";
export const sharedConsoleSchema = {
    $id: SHARED_CONSOLE_SCHEMA_ID,
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: false,
    required: ["version"],
    properties: {
        version: { type: "string", pattern: "^v\\d+\\.\\d+\\.\\d+$" },
        action_key: { type: "string", enum: Object.values(ActionKey) },
        visibility_status: { type: "string", enum: Object.values(VisibilityStatus) },
        readiness_status: { type: "string", enum: Object.values(ReadinessStatus) },
        panel_key: { type: "string", enum: Object.values(PanelKey) },
        filter_operator: { type: "string", enum: Object.values(FilterOperator) },
        sort_direction: { type: "string", enum: Object.values(SortDirection) },
        persisted_state_policy: { type: "string", enum: Object.values(PersistedStatePolicy) },
        severity: { type: "string", enum: Object.values(SeverityLevel) },
    },
};
//# sourceMappingURL=shared-console.schema.js.map