/**
 * Controllo per disabilitare solo la generazione immagini AI (OpenAI Images).
 * Quando DISABLE_AI_IMAGE_GENERATION=true oppure DISABLE_OPENAI=true, le immagini non vengono generate.
 */
import { isOpenAIDisabled } from "./check-openai-disabled";

export function isAiImageGenerationDisabled(): boolean {
  if (isOpenAIDisabled()) return true;
  const v = process.env.DISABLE_AI_IMAGE_GENERATION;
  return v === "true" || v === "1";
}
