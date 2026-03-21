/**
 * SignalProvider registry and orchestration
 */

import type { RawSignal, SignalProvider } from '../types';

const providers: SignalProvider[] = [];

export function registerProvider(provider: SignalProvider): void {
  if (!providers.some((p) => p.id === provider.id)) {
    providers.push(provider);
  }
}

export function getProviders(): SignalProvider[] {
  return [...providers];
}

export function clearProviders(): void {
  providers.length = 0;
}

/**
 * Fetch signals from all registered providers in parallel
 */
export async function fetchAllSignals(options?: {
  limit?: number;
}): Promise<RawSignal[]> {
  const limit = options?.limit ?? 100;
  const results = await Promise.allSettled(
    providers.map((p) => p.fetchSignals({ limit: Math.ceil(limit / providers.length) }))
  );

  const all: RawSignal[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      all.push(...r.value);
    } else {
      console.warn(`[TrendDetection] Provider ${providers[i]?.id} failed:`, r.reason);
    }
  }
  return all;
}
