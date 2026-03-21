/**
 * Crypto Price Feed SignalProvider - Stub
 * Returns empty array until implemented.
 */

import type { RawSignal, SignalProvider } from '../types';

const PROVIDER_ID = 'crypto_feed';

export const cryptoFeedProvider: SignalProvider = {
  id: PROVIDER_ID,

  async fetchSignals(): Promise<RawSignal[]> {
    console.log('[TrendDetection] Provider Crypto Feed not implemented');
    return [];
  },
};
