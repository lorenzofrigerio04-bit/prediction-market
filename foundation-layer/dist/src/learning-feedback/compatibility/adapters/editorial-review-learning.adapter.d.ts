import { type LearningCompatibilityResult } from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningInsight } from "../../insights/entities/learning-insight.entity.js";
import type { EditorialFeedbackSignal } from "../../signals/editorial/entities/editorial-feedback-signal.entity.js";
export type EditorialReviewLearningInput = Readonly<{
    editorial_signal: EditorialFeedbackSignal;
    insight: LearningInsight;
}>;
export declare class EditorialReviewLearningAdapter implements LearningCompatibilityAdapter<EditorialReviewLearningInput> {
    adapt(input: EditorialReviewLearningInput): LearningCompatibilityResult;
}
//# sourceMappingURL=editorial-review-learning.adapter.d.ts.map