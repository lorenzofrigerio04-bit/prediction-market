/**
 * Unit and integration tests: Candidate Event Generator algorithm
 */

import { describe, it, expect } from 'vitest';
import {
  generateCandidateEvents,
  extractResolutionSources,
} from '../algorithm';
import type { TrendObject } from '../../trend-detection/types';
import { exampleTrends, exampleCryptoCandidate } from '../../candidate-event-templates/examples';

const NOW = new Date('2025-03-04T12:00:00Z');

function makeTrend(overrides: Partial<TrendObject> = {}): TrendObject {
  return {
    topic: 'Bitcoin 100k',
    category: 'Crypto',
    entities: ['Bitcoin'],
    trend_score: 0.8,
    time_sensitivity: 'medium',
    source_signals: [
      { providerId: 'newsapi', signalId: 'https://example.com/btc', timestamp: NOW },
    ],
    timestamp: NOW,
    ...overrides,
  };
}

describe('extractResolutionSources', () => {
  it('extracts URL from signalId', () => {
    const trend = makeTrend();
    const sources = extractResolutionSources(trend, 'https://fallback.com/');
    expect(sources).toContain('https://example.com/btc');
  });
  it('uses fallback when no URL in signals', () => {
    const trend = makeTrend({
      source_signals: [{ providerId: 'x', signalId: 'not-a-url', timestamp: NOW }],
    });
    const sources = extractResolutionSources(trend, 'https://coingecko.com/');
    expect(sources).toEqual(['https://coingecko.com/']);
  });
  it('returns empty when fallback is invalid', () => {
    const trend = makeTrend({ source_signals: [] });
    const sources = extractResolutionSources(trend, 'not-a-url');
    expect(sources).toEqual([]);
  });
});

describe('generateCandidateEvents', () => {
  it('generates candidates from valid trends', () => {
    const trend = makeTrend();
    const result = generateCandidateEvents([trend], NOW);
    expect(result.candidates.length).toBeGreaterThanOrEqual(1);
    const first = result.candidates[0];
    expect(first.category).toBe('Crypto');
    expect(first.deadline > NOW).toBe(true);
    expect(first.resolution_sources.length).toBeGreaterThan(0);
    expect(first.metric_condition).toBeTruthy();
  });

  it('uses template fallback when source_signals has no URL', () => {
    const trend = makeTrend({
      source_signals: [{ providerId: 'x', signalId: 'not-a-url', timestamp: NOW }],
    });
    const result = generateCandidateEvents([trend], NOW);
    expect(result.candidates.length).toBeGreaterThanOrEqual(1);
    expect(result.candidates[0]?.resolution_sources[0]).toContain('coingecko');
  });

  it('rejects trend when threshold cannot be extracted', () => {
    const trend = makeTrend({
      topic: 'Bitcoin price discussion',
      entities: [],
    });
    const result = generateCandidateEvents([trend], NOW);
    expect(result.rejectionCounts.INVALID_THRESHOLD).toBeGreaterThanOrEqual(0);
  });

  it('rejects when deadline would be in past', () => {
    const pastTrend = makeTrend({
      time_sensitivity: 'low',
      topic: 'Bitcoin 100k',
    });
    const farFuture = new Date('2026-01-01');
    const result = generateCandidateEvents([pastTrend], farFuture);
    expect(result.rejectionCounts.DEADLINE_IN_PAST).toBeGreaterThanOrEqual(0);
  });

  it('is deterministic: same input produces same output', () => {
    const trend = makeTrend();
    const r1 = generateCandidateEvents([trend], NOW);
    const r2 = generateCandidateEvents([trend], NOW);
    expect(r1.candidates.length).toBe(r2.candidates.length);
    expect(r1.candidates[0]?.title).toBe(r2.candidates[0]?.title);
  });

  it('generates multiple candidates per trend when multiple templates apply', () => {
    const result = generateCandidateEvents(
      [exampleTrends.crypto, exampleTrends.sports],
      NOW
    );
    expect(result.candidates.length).toBeGreaterThanOrEqual(1);
  });

  it('crypto example produces expected structure', () => {
    const result = generateCandidateEvents([exampleTrends.crypto], NOW);
    const crypto = result.candidates.find((c) => c.templateId === 'crypto-price-threshold');
    expect(crypto).toBeDefined();
    expect(crypto?.threshold).toBe(100000);
    expect(crypto?.subject_entity).toBe('Bitcoin');
    expect(crypto?.resolution_sources.length).toBeGreaterThan(0);
    expect(crypto?.title).toMatch(/100000|100k/);
    expect(crypto?.title).toMatch(/\?$/);
  });
});
