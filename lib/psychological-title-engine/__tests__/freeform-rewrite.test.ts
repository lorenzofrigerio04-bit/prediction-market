import { describe, it, expect } from 'vitest';
import { rewriteFreeformTitleForMarket } from '../freeform-rewrite';

describe('rewriteFreeformTitleForMarket', () => {
  it('strips Reported event: prefix and ensures ?', () => {
    expect(rewriteFreeformTitleForMarket('Reported event: Bitcoin supererà 100k?')).toBe(
      'Bitcoin supererà 100k?'
    );
  });

  it('deduplicates repeated phrase', () => {
    const repeated =
      'Otello apre la stagione della Scala, poi nel 2027 Verdi con regia di Guadagnino Otello apre la stagione della Scala, poi nel 2027 Verdi con regia di Guadagnino';
    expect(rewriteFreeformTitleForMarket(repeated)).toBe(
      'Otello apre la stagione della Scala, poi nel 2027 Verdi con regia di Guadagnino?'
    );
  });

  it('truncates to 110 chars and keeps ?', () => {
    const long = 'A'.repeat(120) + '?';
    const out = rewriteFreeformTitleForMarket(long);
    expect(out.length).toBeLessThanOrEqual(110);
    expect(out.endsWith('?')).toBe(true);
  });
});
