import { describe, it, expect } from 'vitest';
import { generatePsychologicalTitle } from '../generate';
import type { StructuredCandidateEvent } from '../../candidate-event-templates/types';

/** Candidate with valid resolution source (not blacklisted) */
function makeCandidate(overrides: Partial<StructuredCandidateEvent> = {}): StructuredCandidateEvent {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + 7);

  return {
    category: 'Crypto',
    subject_entity: 'Bitcoin',
    metric_condition: 'price >= threshold',
    threshold: 100000,
    deadline,
    resolution_sources: ['https://www.coingecko.com/en/coins/bitcoin'],
    edge_case_policy: 'DEFAULT',
    title: 'Titolo originale',
    resolutionCriteriaYes: 'Prezzo >= 100000 USD',
    resolutionCriteriaNo: 'Prezzo < 100000 USD',
    templateId: 'crypto-price-threshold',
    ...overrides,
  };
}

describe('generatePsychologicalTitle', () => {
  it('generates optimized Italian title for crypto price threshold', () => {
    const candidate = makeCandidate();
    const result = generatePsychologicalTitle(candidate);
    expect(result).not.toBeNull();
    expect(result).toContain('Bitcoin');
    expect(result).toMatch(/100k|100\.000|100000/);
    expect(result).toMatch(/\?$/);
    expect(result!.length).toBeLessThanOrEqual(110);
  });

  it('includes entity, threshold, and deadline cue in Italian', () => {
    const candidate = makeCandidate();
    const result = generatePsychologicalTitle(candidate);
    expect(result).not.toBeNull();
    expect(result!.toLowerCase()).toContain('bitcoin');
    expect(result).toMatch(/100k|100\.000|100000/);
    expect(result).toMatch(/prima del|entro il|entro/);
  });

  it('returns fallback for unknown template', () => {
    const candidate = makeCandidate({ templateId: 'unknown-template' });
    const result = generatePsychologicalTitle(candidate);
    expect(result).not.toBeNull();
  });

  it('generates Italian title for sports tournament', () => {
    const candidate = makeCandidate({
      templateId: 'sports-tournament-winner',
      subject_entity: 'Inter',
      threshold: 'Inter',
      resolution_sources: ['https://www.uefa.com/'],
    });
    const result = generatePsychologicalTitle(candidate);
    expect(result).not.toBeNull();
    expect(result).toContain('Inter');
    expect(result).toMatch(/\?$/);
  });

  it('generates Italian title for economy CPI', () => {
    const candidate = makeCandidate({
      templateId: 'economy-cpi',
      subject_entity: 'CPI',
      threshold: 2.5,
      resolution_sources: ['https://ec.europa.eu/eurostat'],
    });
    const result = generatePsychologicalTitle(candidate);
    expect(result).not.toBeNull();
    expect(result).toMatch(/CPI|2[,.]5|%/);
  });
});
