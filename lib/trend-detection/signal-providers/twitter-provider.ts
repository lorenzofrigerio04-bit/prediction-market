/**
 * Twitter/X SignalProvider - Stub
 * Returns empty array until implemented.
 */

import type { RawSignal, SignalProvider } from '../types';

const PROVIDER_ID = 'twitter';

export const twitterProvider: SignalProvider = {
  id: PROVIDER_ID,

  async fetchSignals(): Promise<RawSignal[]> {
    console.log('[TrendDetection] Provider Twitter not implemented');
    return [];
  },
};
