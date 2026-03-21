import type { PermissionAwareViewState } from "../entities/permission-aware-view-state.entity.js";
export type EvaluatePermissionAwareViewInput = Readonly<{
    state: PermissionAwareViewState;
}>;
export interface PermissionAwareViewEvaluator {
    evaluate(input: EvaluatePermissionAwareViewInput): PermissionAwareViewState;
}
//# sourceMappingURL=permission-aware-view-evaluator.d.ts.map