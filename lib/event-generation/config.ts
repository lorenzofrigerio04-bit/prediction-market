/**
 * Configurazione generazione eventi: provider (OpenAI/Anthropic), API key da env, retry.
 * Include regole per scadenza variabile (Fase 4): breve vs medio termine, default per categoria.
 */

import type { AllowedCategory } from "./types";

export type GenerationProvider = "openai" | "anthropic";

export type GenerationConfig = {
  provider: GenerationProvider;
  openaiApiKey: string | null;
  anthropicApiKey: string | null;
  maxRetries: number;
  model: string;
};

/** Tipo di scadenza: breve (1–7 giorni) per eventi con data nota, medio (1–4 settimane) per trend. */
export type ClosureTermType = "shortTerm" | "mediumTerm";

/**
 * Regole per closesAt (Fase 4).
 * - Se titolo/descrizione contengono una data esplicita (partita, elezione, lancio) → closesAt = quella data (o 1h prima).
 * - Altrimenti si usa il default per categoria (shortTerm = 7 giorni, mediumTerm = 14–21 giorni).
 */
export type ClosureRulesConfig = {
  /** Ore minime da ora per cui closesAt deve essere nel futuro (es. 24). */
  minHoursFromNow: number;
  /** Ore prima dell'evento a cui chiudere il mercato quando si rileva una data esplicita (es. 1). */
  hoursBeforeEvent: number;
  /** Giorni di default per categoria quando non c'è data esplicita (breve/medio termine). */
  defaultDaysByCategory: Record<AllowedCategory, number>;
  /** Giorni per tipo shortTerm (usato se l'LLM restituisce type: "shortTerm" e non c'è data). */
  shortTermDays: number;
  /** Giorni per tipo mediumTerm (usato se l'LLM restituisce type: "mediumTerm" e non c'è data). */
  mediumTermDays: number;
};

export const DEFAULT_CLOSURE_RULES: ClosureRulesConfig = {
  minHoursFromNow: 24,
  hoursBeforeEvent: 1,
  shortTermDays: 7,
  mediumTermDays: 21,
  defaultDaysByCategory: {
    Sport: 7,
    Politica: 7,
    Tecnologia: 14,
    Economia: 14,
    Cultura: 7,
    Scienza: 14,
    Intrattenimento: 7,
  },
};

/** Restituisce le regole di chiusura (da env opzionale o default). */
export function getClosureRules(overrides?: Partial<ClosureRulesConfig>): ClosureRulesConfig {
  const minHours = parseInt(process.env.CLOSURE_MIN_HOURS ?? "", 10) || DEFAULT_CLOSURE_RULES.minHoursFromNow;
  const hoursBefore = parseInt(process.env.CLOSURE_HOURS_BEFORE_EVENT ?? "", 10) ?? DEFAULT_CLOSURE_RULES.hoursBeforeEvent;
  return {
    ...DEFAULT_CLOSURE_RULES,
    minHoursFromNow: minHours,
    hoursBeforeEvent: hoursBefore,
    ...overrides,
  };
}

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";

/**
 * Legge configurazione da env.
 * OPENAI_API_KEY o ANTHROPIC_API_KEY; GENERATION_PROVIDER (openai | anthropic) per scegliere.
 */
export function getGenerationConfigFromEnv(overrides?: Partial<GenerationConfig>): GenerationConfig {
  const provider = (process.env.GENERATION_PROVIDER ?? "openai") as GenerationProvider;
  const openaiApiKey = process.env.OPENAI_API_KEY ?? null;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? null;
  const maxRetries = parseInt(process.env.GENERATION_MAX_RETRIES ?? "", 10) || DEFAULT_MAX_RETRIES;
  const model =
    process.env.GENERATION_MODEL ??
    (provider === "anthropic" ? DEFAULT_ANTHROPIC_MODEL : DEFAULT_OPENAI_MODEL);

  return {
    provider,
    openaiApiKey,
    anthropicApiKey,
    maxRetries,
    model,
    ...overrides,
  };
}

/** Restituisce la API key da usare in base al provider. */
export function getApiKeyForProvider(config: GenerationConfig): string {
  if (config.provider === "openai") {
    if (!config.openaiApiKey) throw new Error("OPENAI_API_KEY non impostata");
    return config.openaiApiKey;
  }
  if (config.provider === "anthropic") {
    if (!config.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY non impostata");
    return config.anthropicApiKey;
  }
  throw new Error(`Provider non supportato: ${config.provider}`);
}
