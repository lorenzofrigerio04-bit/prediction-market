import { type LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningRecommendation } from "../../recommendations/entities/learning-recommendation.entity.js";
import type { ReliabilityLearningSignal } from "../../signals/reliability/entities/reliability-learning-signal.entity.js";
export type ReleaseGateLearningInput = Readonly<{
    reliability_signal: ReliabilityLearningSignal;
    recommendation: LearningRecommendation;
}>;
export declare class ReleaseGateLearningAdapter implements LearningCompatibilityAdapter<ReleaseGateLearningInput> {
    adapt(input: ReleaseGateLearningInput): LearningCompatibilityResult;
}
//# sourceMappingURL=release-gate-learning.adapter.d.ts.map