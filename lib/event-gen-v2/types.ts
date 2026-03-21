/**
 * Canonical pipeline candidate type for event generation v2.
 * Used by scoring, dedup, selection, and publishing modules.
 */

import type { EdgeCasePolicyRef } from "./edge-case-policy";
import type { StructuredCandidateEvent } from "../candidate-event-templates/types";
import type { MarketValidationInput } from "../validator/types";

export interface Candidate {
  /** Titolo sorgente prima dell’arricchimento AI (opzionale). */
  rawTitle?: string | null;
  title: string;
  description: string;
  category: string;
  closesAt: Date;
  resolutionAuthorityHost: string;
  resolutionAuthorityType: string;
  resolutionCriteriaYes: string;
  resolutionCriteriaNo: string;
  sourceStorylineId: string;
  templateId: string;
  resolutionSourceUrl?: string | null;
  resolutionSourceSecondary?: string | null;
  resolutionSourceTertiary?: string | null;
  resolutionCriteriaFull?: string | null;
  edgeCasePolicyRef?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  timezone?: string | null;
  sportLeague?: string | null;
  footballDataMatchId?: number | null;
  /** Score storyline (0–100), usato in generazione / scoring. */
  momentum?: number;
  novelty?: number;
  creationMetadata?: Record<string, unknown> | null;
}

/** Style preset IDs for image briefs (aligned with image-brief-engine). */
export type ImageBriefStylePreset =
  | "editorial_photo"
  | "cinematic_noir"
  | "sports_action"
  | "market_chart_abstract"
  | "political_symbolic"
  | "minimal_iconic";

/**
 * Full image brief produced by image-brief-engine / stored on Event.imageBrief.
 */
export interface ImageBrief {
  subject_entities: string[];
  scene_description: string;
  mood_tags: string[];
  composition: string;
  symbolism?: string;
  style_preset: ImageBriefStylePreset;
  final_prompt: string;
  negative_prompt: string;
  alt_text: string;
}

/** Storyline cluster signal (subset of EligibleStoryline) for trend UI / pipeline. */
export interface TrendSignal {
  clusterId: string;
  momentum: number;
  novelty: number;
  authorityType: "OFFICIAL" | "REPUTABLE";
  authorityHost: string;
  articleCount: number;
}

export interface ValidatedCandidate extends Candidate {
  rulebookValid: true;
  needsReview: boolean;
  edgeCasePolicyRef: EdgeCasePolicyRef;
}

/** Alias: structured candidate from TrendObject + template (deterministic generator). */
export type CandidateEvent = StructuredCandidateEvent;

export type { TrendObject } from "../trend-detection/types";

/** Legacy validator input shape (rulebook / market validation). */
export type ValidatedMarket = MarketValidationInput;

/** Scores persisted on Event from publisher v2. */
export interface GenerationScores {
  trend_score: number;
  psychological_score: number;
  clarity_score: number;
  resolution_score: number;
  novelty_score: number;
  image_score: number;
  overall_score: number;
}

/** Decorative image metadata (public surface). */
export interface ImageAsset {
  url: string;
  altText?: string | null;
}

/** Opaque placeholder for MDE draft handles in cross-package exports. */
export type MarketDraft = Record<string, unknown>;
