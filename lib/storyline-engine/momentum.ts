/**
 * Calculate momentum score (0-100) for a storyline
 * Based on temporal buckets: 6h, 24h, 72h
 */

import type { SourceSignalLite } from './types';

/**
 * Calculate momentum score for a storyline
 * 
 * Formula:
 * - n6h = signals in last 6 hours
 * - n24h = signals in last 24 hours
 * - n72h = signals in last 72 hours
 * - raw = (2 * n6h) + (1 * n24h) + (0.5 * n72h)
 * - momentum = min(100, round(raw * 10))
 */
export function calculateMomentum(
  signals: SourceSignalLite[],
  now: Date = new Date()
): number {
  const nowMs = now.getTime();
  const sixHoursAgo = nowMs - 6 * 60 * 60 * 1000;
  const twentyFourHoursAgo = nowMs - 24 * 60 * 60 * 1000;
  const seventyTwoHoursAgo = nowMs - 72 * 60 * 60 * 1000;

  let n6h = 0;
  let n24h = 0;
  let n72h = 0;

  for (const signal of signals) {
    const signalTime = signal.publishedAt.getTime();
    
    if (signalTime >= sixHoursAgo) {
      n6h++;
      n24h++;
      n72h++;
    } else if (signalTime >= twentyFourHoursAgo) {
      n24h++;
      n72h++;
    } else if (signalTime >= seventyTwoHoursAgo) {
      n72h++;
    }
  }

  const raw = 2 * n6h + 1 * n24h + 0.5 * n72h;
  const momentum = Math.min(100, Math.round(raw * 10));

  return momentum;
}
