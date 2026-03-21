import { FeedbackType } from "../../enums/feedback-type.enum.js";
import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import {
  createLearningCompatibilityResult,
  type LearningCompatibilityResult,
} from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { LearningRecommendation } from "../../recommendations/entities/learning-recommendation.entity.js";
import type { EditorialFeedbackSignal } from "../../signals/editorial/entities/editorial-feedback-signal.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";

export type EditorialDecisionLearningInput = Readonly<{
  editorial_signal: EditorialFeedbackSignal;
  recommendation: LearningRecommendation;
}>;

const toStatus = (input: EditorialDecisionLearningInput): LearningCompatibilityStatus => {
  if (input.recommendation.status === RecommendationStatus.BLOCKED) {
    return LearningCompatibilityStatus.INCOMPATIBLE;
  }
  if (input.editorial_signal.feedback_type === FeedbackType.REVISION_REQUEST) {
    return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
  }
  return LearningCompatibilityStatus.COMPATIBLE;
};

export class EditorialDecisionLearningAdapter
  implements LearningCompatibilityAdapter<EditorialDecisionLearningInput>
{
  adapt(input: EditorialDecisionLearningInput): LearningCompatibilityResult {
    const status = toStatus(input);
    return createLearningCompatibilityResult({
      id: createLearningCompatibilityResultId(`lcp_${input.recommendation.id.slice(4)}ed`),
      correlation_id: input.editorial_signal.correlation_id,
      target: LearningCompatibilityTarget.EDITORIAL_DECISION_LEARNING,
      status,
      mapped_artifact: {
        source_id: input.editorial_signal.id,
        target_id: input.recommendation.id,
        readiness: status,
        lossy_fields: ["free_form_editorial_context"],
      },
      notes: ["conservative editorial decision learning bridge"],
    });
  }
}
