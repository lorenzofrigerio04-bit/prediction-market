import { describe, it, expect } from 'vitest';
import { calculateMomentum } from '../momentum';
import type { SourceSignalLite } from '../types';

describe('calculateMomentum', () => {
  it('calculates momentum correctly with signals in different time buckets', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    // Create signals:
    // - 2 signals in last 6h (should count in all buckets)
    // - 3 signals in last 24h but not 6h (should count in 24h and 72h)
    // - 4 signals in last 72h but not 24h (should count only in 72h)
    
    const signals6h: SourceSignalLite[] = [
      {
        id: '1',
        title: 'Signal 1',
        publishedAt: new Date('2024-01-01T10:00:00Z'), // 2h ago
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '2',
        title: 'Signal 2',
        publishedAt: new Date('2024-01-01T11:00:00Z'), // 1h ago
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
    ];
    
    const signals24h: SourceSignalLite[] = [
      {
        id: '3',
        title: 'Signal 3',
        publishedAt: new Date('2024-01-01T06:00:00Z'), // 6h ago (just outside 6h window)
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '4',
        title: 'Signal 4',
        publishedAt: new Date('2024-01-01T00:00:00Z'), // 12h ago
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '5',
        title: 'Signal 5',
        publishedAt: new Date('2023-12-31T20:00:00Z'), // 16h ago
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
    ];
    
    const signals72h: SourceSignalLite[] = [
      {
        id: '6',
        title: 'Signal 6',
        publishedAt: new Date('2023-12-31T12:00:00Z'), // 24h ago (just outside 24h window)
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '7',
        title: 'Signal 7',
        publishedAt: new Date('2023-12-30T12:00:00Z'), // 48h ago
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '8',
        title: 'Signal 8',
        publishedAt: new Date('2023-12-29T12:00:00Z'), // 72h ago
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
      {
        id: '9',
        title: 'Signal 9',
        publishedAt: new Date('2023-12-28T12:00:00Z'), // 96h ago (outside 72h window)
        host: 'example.com',
        sourceType: 'RSS_MEDIA',
      },
    ];
    
    const allSignals = [...signals6h, ...signals24h, ...signals72h];
    
    // Expected calculation:
    // n6h = 2 (signals in last 6h)
    // n24h = 2 + 3 = 5 (signals in last 24h)
    // n72h = 2 + 3 + 3 = 8 (signals in last 72h, excluding the one outside)
    // raw = (2 * 2) + (1 * 5) + (0.5 * 8) = 4 + 5 + 4 = 13
    // momentum = min(100, round(13 * 10)) = min(100, 130) = 100
    
    const momentum = calculateMomentum(allSignals, now);
    
    // Actually, let's recalculate more carefully:
    // Signals within 6h: ids 1, 2 → n6h = 2
    // Signals within 24h but not 6h: ids 3, 4, 5 → n24h = 3 (but total in 24h = 2 + 3 = 5)
    // Signals within 72h but not 24h: ids 6, 7, 8 → n72h = 3 (but total in 72h = 2 + 3 + 3 = 8)
    // raw = (2 * 2) + (1 * 5) + (0.5 * 8) = 4 + 5 + 4 = 13
    // momentum = min(100, round(13 * 10)) = 100
    
    expect(momentum).toBe(100);
  });
  
  it('returns 0 for empty signals array', () => {
    const momentum = calculateMomentum([], new Date());
    expect(momentum).toBe(0);
  });
  
  it('handles signals older than 72h correctly', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    const oldSignal: SourceSignalLite = {
      id: '1',
      title: 'Old Signal',
      publishedAt: new Date('2023-12-01T12:00:00Z'), // 31 days ago
      host: 'example.com',
      sourceType: 'RSS_MEDIA',
    };
    
    const momentum = calculateMomentum([oldSignal], now);
    // Should not count in any bucket, so momentum = 0
    expect(momentum).toBe(0);
  });
  
  it('caps momentum at 100', () => {
    const now = new Date('2024-01-01T12:00:00Z');
    
    // Create many signals in last 6h to push momentum over 100
    const signals: SourceSignalLite[] = Array.from({ length: 20 }, (_, i) => ({
      id: `signal-${i}`,
      title: `Signal ${i}`,
      publishedAt: new Date(now.getTime() - i * 10 * 60 * 1000), // Spread over last few hours
      host: 'example.com',
      sourceType: 'RSS_MEDIA',
    }));
    
    const momentum = calculateMomentum(signals, now);
    expect(momentum).toBeLessThanOrEqual(100);
  });
});
