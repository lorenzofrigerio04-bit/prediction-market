/**
 * Configurazione per generazione immagini AI (Step 9).
 * Legge da env: OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN, AI_IMAGE_MODEL, AI_IMAGE_QUALITY,
 * AI_IMAGE_MAX_RETRIES, AI_IMAGE_RETRY_DELAY_MS, AI_IMAGE_FALLBACK_STYLE_PRESET.
 */

export type AiImageQuality = "low" | "medium" | "high" | "auto";

export interface AiImageGenerationConfig {
  openaiApiKey: string;
  blobToken: string;
  model: string;
  /** Per modelli gpt-image-*: meno token/costo con low, miglior resa con medium/high. */
  quality: AiImageQuality;
  maxRetries: number;
  retryDelayMs: number;
  fallbackStylePreset: string;
}

/**
 * Default: gpt-image-1-mini (meno token in output vs 1.5, buon rapporto qualità/costo).
 * Override: gpt-image-1.5, gpt-image-1, dall-e-3, ecc.
 */
const DEFAULT_MODEL = "gpt-image-1-mini";
const DEFAULT_QUALITY: AiImageQuality = "medium";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 1000;
const DEFAULT_FALLBACK_STYLE_PRESET = "minimal_iconic";

/**
 * Restituisce la configurazione per la generazione immagini.
 * Lancia se mancano le variabili obbligatorie.
 */
export function getAiImageGenerationConfig(): AiImageGenerationConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY ?? null;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? null;
  const model = (process.env.AI_IMAGE_MODEL ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  const rawQuality = (process.env.AI_IMAGE_QUALITY ?? DEFAULT_QUALITY).trim().toLowerCase();
  const quality: AiImageQuality =
    rawQuality === "low" || rawQuality === "medium" || rawQuality === "high" || rawQuality === "auto"
      ? rawQuality
      : DEFAULT_QUALITY;
  const maxRetries = Math.max(
    1,
    parseInt(process.env.AI_IMAGE_MAX_RETRIES ?? String(DEFAULT_MAX_RETRIES), 10) || DEFAULT_MAX_RETRIES
  );
  const retryDelayMs = Math.max(
    100,
    parseInt(process.env.AI_IMAGE_RETRY_DELAY_MS ?? String(DEFAULT_RETRY_DELAY_MS), 10) || DEFAULT_RETRY_DELAY_MS
  );
  const fallbackStylePreset =
    (process.env.AI_IMAGE_FALLBACK_STYLE_PRESET ?? DEFAULT_FALLBACK_STYLE_PRESET).trim() ||
    DEFAULT_FALLBACK_STYLE_PRESET;

  if (!openaiApiKey?.trim()) {
    throw new Error("OPENAI_API_KEY non impostata (richiesta per generazione immagini AI)");
  }
  if (!blobToken?.trim()) {
    throw new Error("BLOB_READ_WRITE_TOKEN non impostato (richiesto per salvataggio immagini)");
  }

  return {
    openaiApiKey: openaiApiKey.trim(),
    blobToken: blobToken.trim(),
    model,
    quality,
    maxRetries,
    retryDelayMs,
    fallbackStylePreset,
  };
}
