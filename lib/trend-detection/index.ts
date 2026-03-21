/**
 * Trend Detection Engine v2.0 - Public API
 *
 * Pluggable SignalProviders → Aggregation → Scoring → Ranking → TrendObject[]
 */

import { registerProvider } from './signal-providers/interface';
import { newsApiProvider } from './signal-providers/newsapi-provider';
import { googleTrendsProvider } from './signal-providers/google-trends-provider';
import { redditProvider } from './signal-providers/reddit-provider';
import { twitterProvider } from './signal-providers/twitter-provider';
import { cryptoFeedProvider } from './signal-providers/crypto-feed-provider';
import { fetchAllSignals } from './signal-providers/interface';
import { getTrendsFromSignals } from './trend-detector';
import { getCachedTrends, setCachedTrends } from './cache';

export type {
  TrendObject,
  RawSignal,
  TimeSensitivity,
  SignalProvider,
  GetTrendsParams,
  AggregatedSignal,
  SourceSignal,
} from './types';

export { aggregateSignals, rankTrends } from './trend-detector';
export { computeTrendScore, computeTimeSensitivity } from './scoring';
export { invalidateTrendCache } from './cache';

// Register providers (NewsAPI implemented, others stubs)
registerProvider(newsApiProvider);
registerProvider(googleTrendsProvider);
registerProvider(redditProvider);
registerProvider(twitterProvider);
registerProvider(cryptoFeedProvider);

export interface GetTrendsResult {
  trends: import('./types').TrendObject[];
}

/**
 * Main entry: fetch signals → aggregate → score → rank → return trends.
 * Uses cache when skipCache is false.
 */
export async function getTrends(
  params?: import('./types').GetTrendsParams
): Promise<GetTrendsResult> {
  const { limit = 50, skipCache = false } = params ?? {};
  const now = new Date();

  if (!skipCache) {
    const cached = await getCachedTrends({ limit });
    if (cached && cached.length > 0) {
      return { trends: cached };
    }
  }

  const signals = await fetchAllSignals({ limit });
  const result = await getTrendsFromSignals(signals, { limit, now });

  if (result.trends.length > 0) {
    await setCachedTrends(result.trends, { limit });
  }

  return result;
}

/** Alias for getTrends - returns TrendObject[] */
export async function getTrendObjects(
  params?: import('./types').GetTrendsParams
): Promise<import('./types').TrendObject[]> {
  const { trends } = await getTrends(params);
  return trends;
}
