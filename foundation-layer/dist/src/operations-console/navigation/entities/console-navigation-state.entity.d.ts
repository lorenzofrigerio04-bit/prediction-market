import { PanelKey } from "../../enums/panel-key.enum.js";
import { PersistedStatePolicy } from "../../enums/persisted-state-policy.enum.js";
import { ViewScope } from "../../enums/view-scope.enum.js";
import type { ConsoleNavigationStateId } from "../../value-objects/operations-console-ids.vo.js";
import type { BreadcrumbState } from "./breadcrumb-state.entity.js";
import type { ConsoleFilterState } from "./console-filter-state.entity.js";
export type ConsoleNavigationState = Readonly<{
    id: ConsoleNavigationStateId;
    version: string;
    active_panel: PanelKey;
    active_filters: ConsoleFilterState;
    selected_entity_ref_nullable: string | null;
    breadcrumb_state: BreadcrumbState;
    user_scope: ViewScope;
    persisted_state_policy: PersistedStatePolicy;
}>;
export declare const createConsoleNavigationState: (input: ConsoleNavigationState) => ConsoleNavigationState;
//# sourceMappingURL=console-navigation-state.entity.d.ts.map