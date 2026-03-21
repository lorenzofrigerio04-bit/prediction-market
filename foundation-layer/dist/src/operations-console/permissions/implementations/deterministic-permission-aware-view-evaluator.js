import { createPermissionAwareViewState } from "../entities/permission-aware-view-state.entity.js";
import { validatePermissionAwareViewState } from "../../validators/validate-permission-aware-view-state.js";
export class DeterministicPermissionAwareViewEvaluator {
    evaluate(input) {
        const report = validatePermissionAwareViewState(input.state);
        if (!report.isValid) {
            throw new Error(`Invalid PermissionAwareViewState: ${report.issues.map((issue) => issue.code).join(",")}`);
        }
        return createPermissionAwareViewState(input.state);
    }
}
//# sourceMappingURL=deterministic-permission-aware-view-evaluator.js.map