/**
 * Psychological Title Engine
 * Transforms StructuredCandidateEvent into engaging, rulebook-compliant market titles.
 * Per titoli freeform (MDE/discovery): rewriteFreeformTitleForMarket.
 */

export { generatePsychologicalTitle } from './generate';
export { rewriteFreeformTitleForMarket } from './freeform-rewrite';
export {
  rewriteTitleForPredictionMarket,
  ensureTitlesForMarket,
} from './rewrite-title-for-market-async';
export type {
  CandidateWithTitle,
  EnsureTitlesForMarketOptions,
  RewriteTitleResult,
} from './rewrite-title-for-market-async';
export { scoreTitle } from './scoring';
export { verifyTitleForResolution } from './verify';
export { getPatternsForTemplate, PATTERNS_BY_TEMPLATE, FALLBACK_PATTERNS } from './pattern-library';
export { ALLOWED_TENSION_VERBS, BLOCKED_WORDS, containsBlockedWord, usesTensionVerb } from './vocabulary';
export type { TitleVariant, TitleScore, ScoredVariant, TitlePattern, TitleEngineConfig } from './types';

