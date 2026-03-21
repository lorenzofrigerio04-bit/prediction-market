/**
 * Scoring deterministico per candidati eventi (BLOCCO 5)
 *
 * Legacy: score 0..100 (momentum, novelty, authority, clarity)
 * Quality scoring: 6 components 0..1, overall_score, gate at 0.75
 */

import type { Candidate as CanonicalPipelineCandidate } from '../event-gen-v2/types';
import type { QualityScores, ScoredCandidate } from './types';
import { MULTI_OPTION_MARKET_TYPES, isMarketTypeId, parseOutcomesJson } from '../market-types';

export interface StorylineStats {
  momentum: number; // 0..100
  novelty: number; // 0..100
}

/** Quality score weights (configurable via env) */
const QUALITY_WEIGHTS = {
  trend: parseFloat(process.env.QUALITY_WEIGHT_TREND ?? '0.25'),
  clarity: parseFloat(process.env.QUALITY_WEIGHT_CLARITY ?? '0.2'),
  psychological: parseFloat(process.env.QUALITY_WEIGHT_PSYCHOLOGICAL ?? '0.15'),
  resolution: parseFloat(process.env.QUALITY_WEIGHT_RESOLUTION ?? '0.2'),
  novelty: parseFloat(process.env.QUALITY_WEIGHT_NOVELTY ?? '0.1'),
  image: parseFloat(process.env.QUALITY_WEIGHT_IMAGE ?? '0.1'),
};

export const QUALITY_THRESHOLD =
  parseFloat(process.env.QUALITY_THRESHOLD ?? '0.75');

export type { QualityScores } from './types';

export function isAboveQualityThreshold(overallScore: number): boolean {
  return overallScore >= QUALITY_THRESHOLD;
}

/**
 * Compute quality scores (0..1 each) and overall weighted score
 */
export function computeQualityScores(
  candidate: CanonicalPipelineCandidate,
  storylineStats: StorylineStats,
  options?: {
    trendScore01?: number;
    psychologicalScore01?: number;
    imageScore01?: number;
  }
): QualityScores {
  const momentum = storylineStats.momentum;
  const novelty = storylineStats.novelty;

  const trend_score =
    options?.trendScore01 ?? Math.min(1, momentum / 100);

  const clarityRaw = calculateClarityScore(candidate);
  const clarity_score = Math.min(1, clarityRaw / 100);

  const psychological_score =
    options?.psychologicalScore01 ?? clarity_score;

  let resolution_score = 0;
  if (candidate.resolutionAuthorityType === 'OFFICIAL') {
    resolution_score = 1;
  } else if (candidate.resolutionAuthorityType === 'REPUTABLE') {
    resolution_score = 0.6;
  }
  const c = candidate as CanonicalPipelineCandidate & {
    resolutionCriteriaFull?: string | null;
    marketType?: string | null;
    outcomes?: unknown;
  };
  if (c?.resolutionCriteriaFull?.trim()) {
    resolution_score = Math.min(1, resolution_score + 0.1);
  }
  // Multi-outcome markets with criteria/outcomes are as resolvable as binary
  const mt = c?.marketType;
  if (mt && isMarketTypeId(mt) && MULTI_OPTION_MARKET_TYPES.includes(mt)) {
    const hasFull = !!c?.resolutionCriteriaFull?.trim();
    const options = parseOutcomesJson(c?.outcomes);
    const hasOutcomes = (options?.length ?? 0) > 0;
    if (hasFull || hasOutcomes) {
      resolution_score = Math.max(resolution_score, 0.8);
    }
  }

  const novelty_score = Math.min(1, novelty / 100);

  const image_score = options?.imageScore01 ?? 0.5;

  const overall_score =
    QUALITY_WEIGHTS.trend * trend_score +
    QUALITY_WEIGHTS.clarity * clarity_score +
    QUALITY_WEIGHTS.psychological * psychological_score +
    QUALITY_WEIGHTS.resolution * resolution_score +
    QUALITY_WEIGHTS.novelty * novelty_score +
    QUALITY_WEIGHTS.image * image_score;

  return {
    trend_score,
    clarity_score,
    psychological_score,
    resolution_score,
    novelty_score,
    image_score,
    overall_score: Math.min(1, Math.max(0, overall_score)),
  };
}

/**
 * Calcola score per un candidato evento (quality scoring v2)
 */
export function scoreCandidate(
  candidate: CanonicalPipelineCandidate,
  storylineStats: StorylineStats,
  options?: {
    trendScore01?: number;
    psychologicalScore01?: number;
    imageScore01?: number;
  }
): ScoredCandidate {
  const qualityScores = computeQualityScores(candidate, storylineStats, options);

  const momentumScore = storylineStats.momentum;
  const noveltyScore = storylineStats.novelty;
  const authorityScore =
    candidate.resolutionAuthorityType === 'OFFICIAL'
      ? 100
      : candidate.resolutionAuthorityType === 'REPUTABLE'
        ? 60
        : 0;
  const clarityScore = calculateClarityScore(candidate);

  let score = Math.round(qualityScores.overall_score * 100);

  const universalIds = ['universal-v1', 'universal-v2', 'universal-v3'];
  if (universalIds.includes(candidate.templateId)) {
    score -= 20;
  }
  const banalPhrases = ['accadrà', 'si verificherà', 'sarà confermato'];
  const titleLower = candidate.title.toLowerCase();
  if (banalPhrases.some((p) => titleLower.includes(p))) {
    score -= 40;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    ...candidate,
    score,
    scoreBreakdown: {
      momentum: momentumScore,
      novelty: noveltyScore,
      authority: authorityScore,
      clarity: clarityScore,
    },
    qualityScores,
    overall_score: qualityScores.overall_score,
  };
}

/**
 * Calcola ClarityScore basato su title e description
 */
function calculateClarityScore(candidate: CanonicalPipelineCandidate): number {
  let score = 50; // base

  const title = candidate.title.toLowerCase();
  const description = candidate.description?.toLowerCase() || '';

  // +20 se title length tra 40 e 100
  if (candidate.title.length >= 40 && candidate.title.length <= 100) {
    score += 20;
  }

  // +20 se title contiene "entro" o una data
  const hasDateKeyword = title.includes('entro');
  const hasDatePattern = /\b\d{1,2}[\/\-]\d{1,2}\b/.test(title) || /\b\d{4}\b/.test(title);
  if (hasDateKeyword || hasDatePattern) {
    score += 20;
  }

  // +10 se description contiene entity/topic (se presente nel candidate)
  // Per semplicità, assumiamo che se description non è vuota e ha lunghezza ragionevole, è un punto positivo
  if (description.length > 20 && description.length < 500) {
    score += 10;
  }

  // -30 se title contiene "non" o "mai" o "nessuno"
  const negativeKeywords = ['non', 'mai', 'nessuno'];
  if (negativeKeywords.some(keyword => title.includes(keyword))) {
    score -= 30;
  }

  // Clamp 0..100
  return Math.max(0, Math.min(100, score));
}

/**
 * Score multiple candidates
 */
export function scoreCandidates(
  candidates: CanonicalPipelineCandidate[],
  storylineStatsMap: Map<string, StorylineStats>
): ScoredCandidate[] {
  return candidates.map(candidate => {
    const stats = storylineStatsMap.get(candidate.sourceStorylineId) || {
      momentum: 0,
      novelty: 0,
    };
    return scoreCandidate(candidate, stats);
  });
}
