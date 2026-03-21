/**
 * AI Title Engine: generazione titolo e scelta market type via LLM.
 * Controllo costi: feature flag, tetto per run, una chiamata per candidato.
 */

export { getAITitleEngineConfig } from './config';
export type { AITitleEngineConfig } from './config';
export type { MarketTypeId, AITitleResult, EnrichCandidatesOptions } from './types';
export { MARKET_TYPES } from './types';
export { generateTitleAndMarketType } from './generate-title-and-market-type';
export { enrichCandidatesWithAITitles } from './enrich-candidates';
