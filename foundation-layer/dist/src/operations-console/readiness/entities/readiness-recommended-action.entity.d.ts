import { ActionKey } from "../../enums/action-key.enum.js";
export type ReadinessRecommendedAction = Readonly<{
    action_key: ActionKey;
    reason: string;
}>;
export declare const createReadinessRecommendedAction: (input: ReadinessRecommendedAction) => ReadinessRecommendedAction;
//# sourceMappingURL=readiness-recommended-action.entity.d.ts.map