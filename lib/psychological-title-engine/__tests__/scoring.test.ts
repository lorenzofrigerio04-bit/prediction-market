import { describe, it, expect } from 'vitest';
import { scoreTitle } from '../scoring';
import type { StructuredCandidateEvent } from '../../candidate-event-templates/types';

const mockCandidate: StructuredCandidateEvent = {
  category: 'Crypto',
  subject_entity: 'Bitcoin',
  metric_condition: 'price >= threshold',
  threshold: 100000,
  deadline: new Date('2025-03-15'),
  resolution_sources: ['https://coingecko.com'],
  edge_case_policy: 'DEFAULT',
  title: '',
  resolutionCriteriaYes: 'Yes',
  resolutionCriteriaNo: 'No',
  templateId: 'crypto-price-threshold',
};

describe('scoreTitle', () => {
  it('scores a good Italian title highly', () => {
    const title = 'Riuscirà Bitcoin a superare 100k USD prima dell\'11 mar?';
    const score = scoreTitle(title, mockCandidate);
    expect(score.clarity).toBeGreaterThan(0.5);
    expect(score.tension).toBe(1);
    expect(score.brevity).toBeGreaterThan(0);
    expect(score.combined).toBeGreaterThan(0.5);
  });

  it('gives reduced clarity for title with blocked word', () => {
    const title = 'Bitcoin maggiore supererà 100k USD entro il 15 mar?';
    const score = scoreTitle(title, mockCandidate);
    expect(score.details?.noBlockedWords).toBe(false);
    expect(score.clarity).toBeLessThan(1);
  });

  it('gives 0 combined for title with multiple conditions', () => {
    const title = 'Bitcoin supererà 100k e scenderà sotto 90k entro il 15 mar?';
    const score = scoreTitle(title, mockCandidate);
    expect(score.details?.singleCondition).toBe(false);
    expect(score.combined).toBe(0);
  });

  it('rewards tension verbs', () => {
    const withVerb = 'Bitcoin supererà 100k USD entro il 15 mar?';
    const withoutVerb = 'Bitcoin arriverà a 100k USD entro il 15 mar?'; // "arriverà" non è nei verbi di tensione
    const scoreWith = scoreTitle(withVerb, mockCandidate);
    const scoreWithout = scoreTitle(withoutVerb, mockCandidate);
    expect(scoreWith.tension).toBe(1); // verbo + ?
    expect(scoreWithout.tension).toBe(0.5); // solo ?
    expect(scoreWith.tension).toBeGreaterThan(scoreWithout.tension);
  });

  it('rewards brevity in target range 50-90', () => {
    const inRange = 'Bitcoin raggiungerà 100.000 USD entro il 15 marzo?'; // ~45 chars, need 50+
    const longer = 'Riuscirà Bitcoin a superare 100k USD prima del 15 marzo?'; // ~52 chars
    const score = scoreTitle(longer, mockCandidate);
    expect(score.brevity).toBe(1);
  });
});
