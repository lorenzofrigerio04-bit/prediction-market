import type { Branded } from "../../common/types/branded.js";
import { createPrefixedId } from "../../common/utils/id.js";

export type EditorialFeedbackSignalId = Branded<string, "EditorialFeedbackSignalId">;
export type ReliabilityLearningSignalId = Branded<string, "ReliabilityLearningSignalId">;
export type LearningAggregationId = Branded<string, "LearningAggregationId">;
export type LearningInsightId = Branded<string, "LearningInsightId">;
export type LearningRecommendationId = Branded<string, "LearningRecommendationId">;
export type ImprovementArtifactId = Branded<string, "ImprovementArtifactId">;
export type LearningCompatibilityResultId = Branded<string, "LearningCompatibilityResultId">;

export const createEditorialFeedbackSignalId = (value: string): EditorialFeedbackSignalId =>
  createPrefixedId(value, "lfs_", "EditorialFeedbackSignalId") as EditorialFeedbackSignalId;

export const createReliabilityLearningSignalId = (value: string): ReliabilityLearningSignalId =>
  createPrefixedId(value, "lrs_", "ReliabilityLearningSignalId") as ReliabilityLearningSignalId;

export const createLearningAggregationId = (value: string): LearningAggregationId =>
  createPrefixedId(value, "lag_", "LearningAggregationId") as LearningAggregationId;

export const createLearningInsightId = (value: string): LearningInsightId =>
  createPrefixedId(value, "lin_", "LearningInsightId") as LearningInsightId;

export const createLearningRecommendationId = (value: string): LearningRecommendationId =>
  createPrefixedId(value, "lrc_", "LearningRecommendationId") as LearningRecommendationId;

export const createImprovementArtifactId = (value: string): ImprovementArtifactId =>
  createPrefixedId(value, "lia_", "ImprovementArtifactId") as ImprovementArtifactId;

export const createLearningCompatibilityResultId = (value: string): LearningCompatibilityResultId =>
  createPrefixedId(value, "lcp_", "LearningCompatibilityResultId") as LearningCompatibilityResultId;
