import type { EntityVersion } from "../../../value-objects/entity-version.vo.js";
import type { Timestamp } from "../../../value-objects/timestamp.vo.js";
import { FinalGateStatus } from "../../enums/final-gate-status.enum.js";
import { DatasetScope } from "../../enums/dataset-scope.enum.js";
import type { ReleaseGateEvaluationId } from "../../value-objects/reliability-ids.vo.js";
import type { BlockingReason } from "../../value-objects/blocking-reason.vo.js";
export type ReleaseGateEvaluation = Readonly<{
    id: ReleaseGateEvaluationId;
    version: EntityVersion;
    evaluated_at: Timestamp;
    target_scope: DatasetScope;
    schema_gate_pass: boolean;
    validator_gate_pass: boolean;
    test_gate_pass: boolean;
    regression_gate_pass: boolean;
    compatibility_gate_pass: boolean;
    readiness_gate_pass: boolean;
    final_gate_status: FinalGateStatus;
    blocking_reasons: readonly BlockingReason[];
}>;
export declare const createReleaseGateEvaluation: (input: ReleaseGateEvaluation) => ReleaseGateEvaluation;
//# sourceMappingURL=release-gate-evaluation.entity.d.ts.map