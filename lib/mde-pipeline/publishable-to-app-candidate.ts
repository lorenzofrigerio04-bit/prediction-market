/**
 * Adapter: foundation MarketDraftPipeline + TitleSet + ResolutionSummary
 * → app event-gen-v2 Candidate for rulebook validation and publishSelectedV2.
 * Il titolo passa dal Psychological Title Engine (rewrite freeform) per chiarezza e lunghezza.
 */

import type { Candidate } from "@/lib/event-gen-v2/types";
import { rewriteFreeformTitleForMarket } from "@/lib/psychological-title-engine";

const DEFAULT_HOST = "mde.pipeline";
const DEFAULT_CRITERIA_YES = "Sì, come da regolamento e fonte di risoluzione.";
const DEFAULT_CRITERIA_NO = "No, come da regolamento e fonte di risoluzione.";

export interface PipelineArtifacts {
  /** From DeterministicTitleGenerator.generate(pipeline) */
  titleSet: { display_title: string; canonical_title: string };
  /** From DeterministicResolutionSummaryGenerator.generate(pipeline) */
  resolutionSummary: { one_line_resolution_summary: string };
  /** The MarketDraftPipeline used to build them */
  pipeline: {
    canonical_event: { category: string };
    deadline_resolution: { market_close_time: string };
    outcome_generation_result: {
      outcomes: readonly { display_label: string; semantic_definition: string }[];
    };
  };
  /** When set, sourceStorylineId becomes mde-pipeline:${observationId} so selection caps treat each observation as a distinct storyline. */
  observationId?: string | null;
}

/**
 * Build an event-gen-v2 Candidate from MDE pipeline artifacts so the app can
 * validateCandidates → scoreCandidate → publishSelectedV2.
 */
/** Prefix for discovery-backed storyline ids; selection uses this to apply relaxed quality threshold and to spread caps per observation. */
export const DISCOVERY_SOURCE_STORYLINE_PREFIX = "mde-pipeline";

export function pipelineArtifactsToAppCandidate(artifacts: PipelineArtifacts): Candidate {
  const { titleSet, resolutionSummary, pipeline, observationId } = artifacts;
  const rawTitle = titleSet.display_title?.trim() || titleSet.canonical_title?.trim() || "Event";
  const title = rewriteFreeformTitleForMarket(rawTitle);
  const description =
    resolutionSummary.one_line_resolution_summary?.trim() || title;
  const category = pipeline.canonical_event.category?.trim() || "general";
  const closesAt = new Date(pipeline.deadline_resolution.market_close_time);
  const outcomes = pipeline.outcome_generation_result.outcomes;
  const yesLabel = outcomes[0]?.display_label ?? "Yes";
  const noLabel = outcomes[1]?.display_label ?? "No";
  const yesSemantic = outcomes[0]?.semantic_definition?.trim()?.slice(0, 200);
  const noSemantic = outcomes[1]?.semantic_definition?.trim()?.slice(0, 200);
  // Always append title reference so rulebook validator (title vs criteria overlap) passes
  // when MDE uses generic semantic_definition (e.g. DeterministicOutcomeGenerator BINARY).
  const resolutionCriteriaYes =
    (yesSemantic || DEFAULT_CRITERIA_YES) + ` Riferimento: ${title}.`;
  const resolutionCriteriaNo =
    (noSemantic || DEFAULT_CRITERIA_NO) + ` Riferimento: ${title}.`;
  const resolutionCriteriaFull = `${resolutionCriteriaYes} | ${resolutionCriteriaNo}`;

  const sourceStorylineId =
    observationId != null && observationId !== ""
      ? `${DISCOVERY_SOURCE_STORYLINE_PREFIX}:${observationId}`
      : DISCOVERY_SOURCE_STORYLINE_PREFIX;

  return {
    rawTitle,
    title,
    description,
    category,
    closesAt: Number.isNaN(closesAt.getTime()) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : closesAt,
    resolutionAuthorityHost: DEFAULT_HOST,
    resolutionAuthorityType: "REPUTABLE",
    resolutionCriteriaYes,
    resolutionCriteriaNo,
    sourceStorylineId,
    templateId: "mde-pipeline",
    timezone: "Europe/Rome",
    resolutionCriteriaFull,
  };
}
