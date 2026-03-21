/**
 * Google Trends SignalProvider - Stub
 * Returns empty array until implemented.
 */

import type { RawSignal, SignalProvider } from '../types';

const PROVIDER_ID = 'google_trends';

export const googleTrendsProvider: SignalProvider = {
  id: PROVIDER_ID,

  async fetchSignals(): Promise<RawSignal[]> {
    console.log('[TrendDetection] Provider Google Trends not implemented');
    return [];
  },
};
