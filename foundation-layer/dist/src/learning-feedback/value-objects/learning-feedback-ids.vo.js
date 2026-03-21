import { createPrefixedId } from "../../common/utils/id.js";
export const createEditorialFeedbackSignalId = (value) => createPrefixedId(value, "lfs_", "EditorialFeedbackSignalId");
export const createReliabilityLearningSignalId = (value) => createPrefixedId(value, "lrs_", "ReliabilityLearningSignalId");
export const createLearningAggregationId = (value) => createPrefixedId(value, "lag_", "LearningAggregationId");
export const createLearningInsightId = (value) => createPrefixedId(value, "lin_", "LearningInsightId");
export const createLearningRecommendationId = (value) => createPrefixedId(value, "lrc_", "LearningRecommendationId");
export const createImprovementArtifactId = (value) => createPrefixedId(value, "lia_", "ImprovementArtifactId");
export const createLearningCompatibilityResultId = (value) => createPrefixedId(value, "lcp_", "LearningCompatibilityResultId");
//# sourceMappingURL=learning-feedback-ids.vo.js.map