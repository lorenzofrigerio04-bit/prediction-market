/**
 * Reddit SignalProvider - Stub
 * Returns empty array until implemented.
 */

import type { RawSignal, SignalProvider } from '../types';

const PROVIDER_ID = 'reddit';

export const redditProvider: SignalProvider = {
  id: PROVIDER_ID,

  async fetchSignals(): Promise<RawSignal[]> {
    console.log('[TrendDetection] Provider Reddit not implemented');
    return [];
  },
};
