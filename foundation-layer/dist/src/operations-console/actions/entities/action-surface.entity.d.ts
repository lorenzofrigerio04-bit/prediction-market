import { ActionKey } from "../../enums/action-key.enum.js";
import type { ActionSurfaceId } from "../../value-objects/operations-console-ids.vo.js";
import type { ActionConstraint } from "./action-constraint.entity.js";
import type { PermissionBasis } from "./permission-basis.entity.js";
export type ActionSurface = Readonly<{
    id: ActionSurfaceId;
    version: string;
    target_ref: string;
    available_action_keys: readonly ActionKey[];
    hidden_action_keys: readonly ActionKey[];
    disabled_action_keys: readonly ActionKey[];
    action_constraints: readonly ActionConstraint[];
    permission_basis: PermissionBasis;
}>;
export declare const createActionSurface: (input: ActionSurface) => ActionSurface;
//# sourceMappingURL=action-surface.entity.d.ts.map