import { type LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { ImprovementArtifact } from "../../improvements/entities/improvement-artifact.entity.js";
import type { LearningRecommendation } from "../../recommendations/entities/learning-recommendation.entity.js";
export type PublishableCandidateLearningInput = Readonly<{
    recommendation: LearningRecommendation;
    improvement: ImprovementArtifact;
}>;
export declare class PublishableCandidateLearningAdapter implements LearningCompatibilityAdapter<PublishableCandidateLearningInput> {
    adapt(input: PublishableCandidateLearningInput): LearningCompatibilityResult;
}
//# sourceMappingURL=publishable-candidate-learning.adapter.d.ts.map