import type { DatasetScope } from "../../enums/dataset-scope.enum.js";
import type { ReleaseGateEvaluation } from "../entities/release-gate-evaluation.entity.js";
export type ReleaseGateInput = Readonly<{
    target_scope: DatasetScope;
    schema_gate_pass: boolean;
    validator_gate_pass: boolean;
    test_gate_pass: boolean;
    regression_gate_pass: boolean;
    compatibility_gate_pass: boolean;
    readiness_gate_pass: boolean;
}>;
export interface ReleaseGateEvaluator {
    evaluate(input: ReleaseGateInput): ReleaseGateEvaluation;
}
//# sourceMappingURL=release-gate-evaluator.d.ts.map