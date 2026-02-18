/**
 * Scoring deterministico per candidati eventi (BLOCCO 5)
 * 
 * Calcola score 0..100 basato su:
 * - Momentum (40%)
 * - Novelty (20%)
 * - Authority (20%)
 * - Clarity (20%)
 */

import type { GeneratedEventCandidate } from '../event-generation-v2';
import type { ScoredCandidate } from './types';

export interface StorylineStats {
  momentum: number; // 0..100
  novelty: number; // 0..100
}

/**
 * Calcola score per un candidato evento
 */
export function scoreCandidate(
  candidate: GeneratedEventCandidate,
  storylineStats: StorylineStats
): ScoredCandidate {
  // A) MomentumScore = storyline.momentum (0..100)
  const momentumScore = storylineStats.momentum;

  // B) NoveltyScore = storyline.novelty (0..100)
  const noveltyScore = storylineStats.novelty;

  // C) AuthorityScore
  let authorityScore: number;
  if (candidate.resolutionAuthorityType === 'OFFICIAL') {
    authorityScore = 100;
  } else if (candidate.resolutionAuthorityType === 'REPUTABLE') {
    authorityScore = 60;
  } else {
    authorityScore = 0;
  }

  // D) ClarityScore (0..100)
  const clarityScore = calculateClarityScore(candidate);

  let score = Math.round(
    0.4 * momentumScore +
    0.2 * noveltyScore +
    0.2 * authorityScore +
    0.2 * clarityScore
  );

  // Penalty template universal (anti-banalità)
  const universalIds = ['universal-v1', 'universal-v2', 'universal-v3'];
  if (universalIds.includes(candidate.templateId)) {
    score -= 20;
  }
  // Penalty titoli banali (hard)
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
  };
}

/**
 * Calcola ClarityScore basato su title e description
 */
function calculateClarityScore(candidate: GeneratedEventCandidate): number {
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
  candidates: GeneratedEventCandidate[],
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
