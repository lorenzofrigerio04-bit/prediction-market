/**
 * Arricchisce i candidati con titolo e market type da AI (fino a maxCalls per run).
 * Fallback: in caso di errore o AI disabilitata il titolo resta quello rule-based.
 */

import type { Candidate } from '@/lib/event-gen-v2/types';
import { getAITitleEngineConfig } from './config';
import { generateTitleAndMarketType } from './generate-title-and-market-type';
import type { EnrichCandidatesOptions } from './types';

/**
 * Per i primi maxCalls candidati (o meno se config lo riduce), chiama l'LLM
 * e sostituisce title con quello generato e imposta marketType.
 * Gli altri candidati restano invariati. In caso di errore su un candidato
 * si mantiene il titolo esistente (fallback).
 */
export async function enrichCandidatesWithAITitles(
  candidates: Candidate[],
  options?: EnrichCandidatesOptions
): Promise<void> {
  const config = getAITitleEngineConfig();
  const maxCalls = options?.maxCalls ?? config.maxCallsPerRun;
  if (!config.enabled || candidates.length === 0 || maxCalls <= 0) {
    return;
  }

  const limit = Math.min(maxCalls, candidates.length);

  for (let i = 0; i < limit; i++) {
    const c = candidates[i]!;
    const inputTitle = (c.rawTitle ?? c.title)?.trim() || c.title;
    if (!inputTitle) continue;

    const result = await generateTitleAndMarketType(inputTitle, c.category);
    if (result) {
      c.title = result.title;
      c.marketType = result.market_type;
    }
    // else: fallback = lasciamo c.title com'è
  }
}
