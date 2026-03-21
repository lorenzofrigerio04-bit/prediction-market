/**
 * Controllo centralizzato per disabilitare tutte le chiamate OpenAI.
 * Quando DISABLE_OPENAI=true, nessun servizio deve invocare API OpenAI.
 */
export function isOpenAIDisabled(): boolean {
  return process.env.DISABLE_OPENAI === "true" || process.env.DISABLE_OPENAI === "1";
}
