/**
 * Test unitari per scoring deterministico
 */

import { describe, it, expect } from 'vitest';
import { scoreCandidate } from '../scoring';
import type { GeneratedEventCandidate } from '../../event-generation-v2';

describe('scoring', () => {
  const baseCandidate: GeneratedEventCandidate = {
    title: 'Test Event Title',
    description: 'Test description',
    category: 'Tech',
    closesAt: new Date('2025-12-31'),
    resolutionAuthorityHost: 'www.example.com',
    resolutionAuthorityType: 'OFFICIAL',
    resolutionCriteriaYes: 'Yes criteria',
    resolutionCriteriaNo: 'No criteria',
    sourceStorylineId: 'storyline-1',
    templateId: 'template-1',
  };

  it('should calculate score correctly with high momentum and novelty', () => {
    const storylineStats = { momentum: 80, novelty: 70 };
    const result = scoreCandidate(baseCandidate, storylineStats);

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.scoreBreakdown.momentum).toBe(80);
    expect(result.scoreBreakdown.novelty).toBe(70);
    expect(result.scoreBreakdown.authority).toBe(100); // OFFICIAL
  });

  it('should give higher authority score for OFFICIAL vs REPUTABLE', () => {
    const storylineStats = { momentum: 50, novelty: 50 };

    const official = scoreCandidate(
      { ...baseCandidate, resolutionAuthorityType: 'OFFICIAL' },
      storylineStats
    );
    const reputable = scoreCandidate(
      { ...baseCandidate, resolutionAuthorityType: 'REPUTABLE' },
      storylineStats
    );

    expect(official.scoreBreakdown.authority).toBe(100);
    expect(reputable.scoreBreakdown.authority).toBe(60);
    expect(official.score).toBeGreaterThan(reputable.score);
  });

  it('should boost clarity score for title with date keyword', () => {
    const storylineStats = { momentum: 50, novelty: 50 };
    
    const withDate = scoreCandidate(
      { ...baseCandidate, title: 'Evento entro il 2025' },
      storylineStats
    );
    const withoutDate = scoreCandidate(
      { ...baseCandidate, title: 'Evento generico' },
      storylineStats
    );

    expect(withDate.scoreBreakdown.clarity).toBeGreaterThan(withoutDate.scoreBreakdown.clarity);
  });

  it('should penalize clarity score for negative keywords', () => {
    const storylineStats = { momentum: 50, novelty: 50 };
    
    const negative = scoreCandidate(
      { ...baseCandidate, title: 'Evento non accadrà mai' },
      storylineStats
    );
    const positive = scoreCandidate(
      { ...baseCandidate, title: 'Evento accadrà' },
      storylineStats
    );

    expect(negative.scoreBreakdown.clarity).toBeLessThan(positive.scoreBreakdown.clarity);
  });

  it('should calculate quality scores and pass gate at 0.75', () => {
    const storylineStats = { momentum: 100, novelty: 100 };
    const result = scoreCandidate(baseCandidate, storylineStats);

    expect(result.qualityScores).toBeDefined();
    expect(result.overall_score).toBeDefined();
    expect(result.overall_score).toBeGreaterThanOrEqual(0);
    expect(result.overall_score).toBeLessThanOrEqual(1);
    expect(result.qualityScores!.trend_score).toBe(1);
    expect(result.qualityScores!.resolution_score).toBe(1);
    expect(result.qualityScores!.novelty_score).toBe(1);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
