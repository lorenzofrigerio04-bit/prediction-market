import type { PermissionAwareViewState } from "../entities/permission-aware-view-state.entity.js";
import { createPermissionAwareViewState } from "../entities/permission-aware-view-state.entity.js";
import type {
  EvaluatePermissionAwareViewInput,
  PermissionAwareViewEvaluator,
} from "../interfaces/permission-aware-view-evaluator.js";
import { validatePermissionAwareViewState } from "../../validators/validate-permission-aware-view-state.js";

export class DeterministicPermissionAwareViewEvaluator implements PermissionAwareViewEvaluator {
  evaluate(input: EvaluatePermissionAwareViewInput): PermissionAwareViewState {
    const report = validatePermissionAwareViewState(input.state);
    if (!report.isValid) {
      throw new Error(`Invalid PermissionAwareViewState: ${report.issues.map((issue) => issue.code).join(",")}`);
    }
    return createPermissionAwareViewState(input.state);
  }
}
