/**
 * Configurazione per generazione immagini AI (Step 9).
 * Legge da env: OPENAI_API_KEY, BLOB_READ_WRITE_TOKEN, AI_IMAGE_MODEL.
 */

export interface AiImageGenerationConfig {
  openaiApiKey: string;
  blobToken: string;
  model: string;
}

/** Default: GPT Image 1.5 per massimo realismo e aderenza al tema. Altri: gpt-image-1, gpt-image-1-mini, dall-e-3. */
const DEFAULT_MODEL = "gpt-image-1.5";

/**
 * Restituisce la configurazione per la generazione immagini.
 * Lancia se mancano le variabili obbligatorie.
 */
export function getAiImageGenerationConfig(): AiImageGenerationConfig {
  const openaiApiKey = process.env.OPENAI_API_KEY ?? null;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN ?? null;
  const model = (process.env.AI_IMAGE_MODEL ?? DEFAULT_MODEL).trim() || DEFAULT_MODEL;

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
  };
}
