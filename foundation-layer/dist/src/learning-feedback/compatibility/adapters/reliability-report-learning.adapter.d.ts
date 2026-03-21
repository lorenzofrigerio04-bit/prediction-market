import { type LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningInsight } from "../../insights/entities/learning-insight.entity.js";
import type { ReliabilityLearningSignal } from "../../signals/reliability/entities/reliability-learning-signal.entity.js";
export type ReliabilityReportLearningInput = Readonly<{
    reliability_signal: ReliabilityLearningSignal;
    insight: LearningInsight;
}>;
export declare class ReliabilityReportLearningAdapter implements LearningCompatibilityAdapter<ReliabilityReportLearningInput> {
    adapt(input: ReliabilityReportLearningInput): LearningCompatibilityResult;
}
//# sourceMappingURL=reliability-report-learning.adapter.d.ts.map