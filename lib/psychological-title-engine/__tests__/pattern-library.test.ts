import { describe, it, expect } from 'vitest';
import { getPatternsForTemplate, PATTERNS_BY_TEMPLATE } from '../pattern-library';

describe('getPatternsForTemplate', () => {
  it('returns patterns for crypto-price-threshold', () => {
    const patterns = getPatternsForTemplate('crypto-price-threshold');
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.length).toBeLessThanOrEqual(5);
    expect(patterns[0].template).toContain('[ENTITY]');
    expect(patterns[0].template).toContain('[THRESHOLD]');
    expect(patterns[0].template).toContain('[DATE]');
  });

  it('returns patterns for sports-tournament-winner', () => {
    const patterns = getPatternsForTemplate('sports-tournament-winner');
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('returns fallback patterns for unknown template', () => {
    const patterns = getPatternsForTemplate('unknown-template-xyz');
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns[0].id).toContain('fallback');
  });
});

describe('PATTERNS_BY_TEMPLATE', () => {
  it('has patterns for all known template IDs', () => {
    const knownTemplates = [
      'crypto-price-threshold',
      'crypto-market-cap-threshold',
      'sports-match-winner',
      'sports-tournament-winner',
      'tech-product-release',
      'tech-earnings-report',
      'politics-election-winner',
      'politics-nomination-confirmation',
      'economy-cpi',
      'economy-interest-rate',
      'economy-gdp',
      'culture-award-winner',
      'culture-box-office-revenue',
    ];
    for (const id of knownTemplates) {
      const patterns = PATTERNS_BY_TEMPLATE[id];
      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns!.length).toBeGreaterThan(0);
    }
  });
});
