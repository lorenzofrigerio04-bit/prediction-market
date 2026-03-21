import { type LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningRecommendation } from "../../recommendations/entities/learning-recommendation.entity.js";
import type { EditorialFeedbackSignal } from "../../signals/editorial/entities/editorial-feedback-signal.entity.js";
export type EditorialDecisionLearningInput = Readonly<{
    editorial_signal: EditorialFeedbackSignal;
    recommendation: LearningRecommendation;
}>;
export declare class EditorialDecisionLearningAdapter implements LearningCompatibilityAdapter<EditorialDecisionLearningInput> {
    adapt(input: EditorialDecisionLearningInput): LearningCompatibilityResult;
}
//# sourceMappingURL=editorial-decision-learning.adapter.d.ts.map