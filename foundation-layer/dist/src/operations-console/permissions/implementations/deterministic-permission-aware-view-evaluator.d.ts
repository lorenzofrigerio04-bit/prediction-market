import type { PermissionAwareViewState } from "../entities/permission-aware-view-state.entity.js";
import type { EvaluatePermissionAwareViewInput, PermissionAwareViewEvaluator } from "../interfaces/permission-aware-view-evaluator.js";
export declare class DeterministicPermissionAwareViewEvaluator implements PermissionAwareViewEvaluator {
    evaluate(input: EvaluatePermissionAwareViewInput): PermissionAwareViewState;
}
//# sourceMappingURL=deterministic-permission-aware-view-evaluator.d.ts.map