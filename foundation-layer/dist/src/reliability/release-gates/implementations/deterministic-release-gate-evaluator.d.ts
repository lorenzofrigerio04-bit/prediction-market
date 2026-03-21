import { type ReleaseGateEvaluation } from "../entities/release-gate-evaluation.entity.js";
import type { ReleaseGateEvaluator, ReleaseGateInput } from "../interfaces/release-gate-evaluator.js";
export declare class DeterministicReleaseGateEvaluator implements ReleaseGateEvaluator {
    evaluate(input: ReleaseGateInput): ReleaseGateEvaluation;
}
//# sourceMappingURL=deterministic-release-gate-evaluator.d.ts.map