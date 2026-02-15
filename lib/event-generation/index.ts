/**
 * Modulo generazione eventi con LLM (Fase 3).
 *
 * Da candidati verificati (Fase 2) produce eventi pronti per la creazione
 * (title, description, category, closesAt, resolutionSourceUrl, resolutionNotes).
 */

export { generateEventsFromCandidates } from "./generate";
export { getGenerationConfigFromEnv, getApiKeyForProvider } from "./config";
export { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
export { parseGeneratedEvents, validateGeneratedEvent } from "./schema";
export type { GeneratedEvent, GenerateEventsOptions, AllowedCategory } from "./types";
export { ALLOWED_CATEGORIES } from "./types";
