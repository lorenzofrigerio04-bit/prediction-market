/**
 * Market success score calculation for feed back into generation.
 * Formula: (volumeRate * 0.4) + (userRate * 0.3) + (ctr * 0.3)
 * - volumeRate = volume / hours
 * - userRate = uniqueUsers / hours
 * - ctr = clicks / impressions (0 if impressions === 0)
 */

export interface HourlyMetrics {
  volume: number;
  uniqueUsers: number;
  impressions: number;
  clicks: number;
}

const VOLUME_WEIGHT = 0.4;
const USER_RATE_WEIGHT = 0.3;
const CTR_WEIGHT = 0.3;

/**
 * Compute volume rate (volume per hour). For a single hour bucket, hours = 1.
 */
export function volumeRate(volume: number, hours: number = 1): number {
  if (hours <= 0) return 0;
  return volume / hours;
}

/**
 * Compute user rate (unique users per hour). For a single hour bucket, hours = 1.
 */
export function userRate(uniqueUsers: number, hours: number = 1): number {
  if (hours <= 0) return 0;
  return uniqueUsers / hours;
}

/**
 * Compute CTR (clicks / impressions). Returns 0 if impressions === 0.
 */
export function ctr(clicks: number, impressions: number): number {
  if (impressions <= 0) return 0;
  return clicks / impressions;
}

/**
 * Calculate market success score from hourly metrics.
 * Score = (volumeRate * 0.4) + (userRate * 0.3) + (ctr * 0.3)
 *
 * @param metrics - Hourly aggregated metrics
 * @param hours - Time window in hours (default 1 for a single hour bucket)
 */
export function calculateSuccessScore(
  metrics: HourlyMetrics,
  hours: number = 1
): number {
  const volRate = volumeRate(metrics.volume, hours);
  const uRate = userRate(metrics.uniqueUsers, hours);
  const clickThroughRate = ctr(metrics.clicks, metrics.impressions);
  return (
    volRate * VOLUME_WEIGHT +
    uRate * USER_RATE_WEIGHT +
    clickThroughRate * CTR_WEIGHT
  );
}
