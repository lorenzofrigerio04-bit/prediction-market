/**
 * Configurazione AI Title Engine: titolo e market type via LLM.
 * Limiti per evitare picchi di richieste e costi elevati.
 */

import { isOpenAIDisabled } from '@/lib/check-openai-disabled';

const DEFAULT_MAX_CALLS_PER_RUN = 20;
const DEFAULT_MODEL = 'gpt-4o-mini';

export interface AITitleEngineConfig {
  enabled: boolean;
  maxCallsPerRun: number;
  model: string;
  openaiApiKey: string | null;
}

export function getAITitleEngineConfig(): AITitleEngineConfig {
  const openaiDisabled = isOpenAIDisabled();
  const useAI = process.env.USE_AI_TITLE_GENERATION === 'true' || process.env.USE_AI_TITLE_GENERATION === '1';
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim() ?? null;

  const rawMax = process.env.OPENAI_MAX_TITLE_CALLS_PER_RUN?.trim();
  const maxCallsPerRun = rawMax ? Math.max(0, parseInt(rawMax, 10)) : DEFAULT_MAX_CALLS_PER_RUN;
  const model = process.env.AI_TITLE_MODEL?.trim() || DEFAULT_MODEL;

  return {
    enabled: useAI && !openaiDisabled && !!openaiApiKey,
    maxCallsPerRun: Number.isNaN(maxCallsPerRun) ? DEFAULT_MAX_CALLS_PER_RUN : maxCallsPerRun,
    model,
    openaiApiKey,
  };
}
