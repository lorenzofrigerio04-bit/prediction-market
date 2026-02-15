/**
 * Configurazione generazione eventi: provider (OpenAI/Anthropic), API key da env, retry.
 */

export type GenerationProvider = "openai" | "anthropic";

export type GenerationConfig = {
  provider: GenerationProvider;
  openaiApiKey: string | null;
  anthropicApiKey: string | null;
  maxRetries: number;
  model: string;
};

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
