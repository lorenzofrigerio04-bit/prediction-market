/**
 * Event Gen v2.0 - Clean pipeline for PredictionMaster
 *
 * Trend Detector → Candidate Generator → Title Engine → Rulebook Validator →
 * Quality Scoring → Publisher
 */

export { runEventGenV2Pipeline } from './run-pipeline';
export type { RunEventGenV2Params, EventGenV2Result } from './run-pipeline';

export { getTrendSignals, getEligibleStorylines } from './trend-detector';

export { generateCandidates } from './candidate-generator';
export type { GenerateCandidatesParams, GenerateCandidatesResult } from './candidate-generator';

export { validateCandidates } from './rulebook-validator';
export type { RulebookValidationResult } from './rulebook-validator';

export { validateRulebookV2, checkImageCompliance } from './rulebook-validator/index';
export type { RulebookV2Input, RulebookV2Result } from './rulebook-validator/index';
export type { RulebookError, RulebookErrorSeverity } from './rulebook-validator/index';
export { RULEBOOK_ERROR_CODES } from './rulebook-validator/index';

export { publishSelectedV2 } from './publisher';
export { generateMarketId, getNextMarketId } from './market-id';
export {
  createRunId,
  logPipelineStage,
  onPipelineStart,
  onPipelineComplete,
  onPipelineError,
  onStageComplete,
} from './observability';
export type { PipelineStage, PipelineLogEntry } from './observability';

export type {
  Candidate,
  CandidateEvent,
  ValidatedCandidate,
  ValidatedMarket,
  ScoredCandidate,
  TrendObject,
  TrendSignal,
  GenerationScores,
  ImageBrief,
  ImageAsset,
  MarketDraft,
} from './types';
export { EdgeCasePolicyRef } from './edge-case-policy';
export type { EdgeCasePolicyRef as EdgeCasePolicyRefType } from './edge-case-policy';
