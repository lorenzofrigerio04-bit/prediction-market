/**
 * MDE pipeline: SourceObservation → Interpretation → EventCandidate → CanonicalEvent
 * → Opportunity / Contract / Outcome / Deadline / Source / Scorecard → MarketDraftPipeline
 * → Title / Summary / Rulebook → PublishableCandidate.
 */

export { interpretObservation } from "./observation-interpreter";
export { interpretationToEventCandidate } from "./interpretation-to-candidate";
export type { ObservationInterpretation } from "./interpretation-to-candidate";
export { candidateToCanonicalEvent } from "./candidate-to-canonical";
export type { EventCandidate } from "./candidate-to-canonical";
export {
  runMdePipelineFromObservation,
  type RunMdePipelineParams,
  type RunMdePipelineResult,
  type PublishableCandidate,
} from "./run-mde-pipeline";
export {
  pipelineArtifactsToAppCandidate,
  type PipelineArtifacts,
} from "./publishable-to-app-candidate";
export {
  runDiscoveryBackedPipeline,
  runDiscoveryBackedPipelineFromLeads,
  type DiscoveryBackedPipelineLeadResult,
  type DiscoveryBackedPipelineResult,
  type DiscoveryBackedPipelineParams,
  type PipelineRunner,
} from "./run-discovery-backed-pipeline";
