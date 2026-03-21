import { LearningCompatibilityStatus } from "../../enums/learning-compatibility-status.enum.js";
import { LearningCompatibilityTarget } from "../../enums/learning-compatibility-target.enum.js";
import { RecommendationStatus } from "../../enums/recommendation-status.enum.js";
import {
  createLearningCompatibilityResult,
  type LearningCompatibilityResult,
} from "../entities/learning-compatibility-result.entity.js";
import type { LearningCompatibilityAdapter } from "../interfaces/learning-compatibility-adapter.js";
import type { ImprovementArtifact } from "../../improvements/entities/improvement-artifact.entity.js";
import type { LearningRecommendation } from "../../recommendations/entities/learning-recommendation.entity.js";
import { createLearningCompatibilityResultId } from "../../value-objects/learning-feedback-ids.vo.js";

export type PublishableCandidateLearningInput = Readonly<{
  recommendation: LearningRecommendation;
  improvement: ImprovementArtifact;
}>;

const toStatus = (input: PublishableCandidateLearningInput): LearningCompatibilityStatus => {
  if (input.recommendation.status === RecommendationStatus.BLOCKED) {
    return LearningCompatibilityStatus.INCOMPATIBLE;
  }
  if (input.recommendation.status === RecommendationStatus.DRAFT) {
    return LearningCompatibilityStatus.COMPATIBLE_WITH_WARNINGS;
  }
  return LearningCompatibilityStatus.COMPATIBLE;
};

export class PublishableCandidateLearningAdapter
  implements LearningCompatibilityAdapter<PublishableCandidateLearningInput>
{
  adapt(input: PublishableCandidateLearningInput): LearningCompatibilityResult {
    const status = toStatus(input);
    return createLearningCompatibilityResult({
      id: createLearningCompatibilityResultId(`lcp_${input.improvement.id.slice(4)}pc`),
      correlation_id: input.recommendation.correlation_id,
      target: LearningCompatibilityTarget.PUBLISHABLE_CANDIDATE_LEARNING,
      status,
      mapped_artifact: {
        source_id: input.recommendation.id,
        target_id: input.improvement.id,
        readiness: status,
        lossy_fields: ["editorial_annotations", "runtime_counters"],
      },
      notes: ["loss-aware mapping to publishable candidate learning payload"],
    });
  }
}
