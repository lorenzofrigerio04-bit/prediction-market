/**
 * Modulo generazione eventi con LLM (Fase 3).
 * Fase 4: scadenza variabile (breve vs medio termine) via computeClosesAt.
 *
 * Da candidati verificati (Fase 2) produce eventi pronti per la creazione
 * (title, description, category, closesAt, resolutionSourceUrl, resolutionNotes).
 */

export { generateEventsFromCandidates } from "./generate";
export { getGenerationConfigFromEnv, getApiKeyForProvider, getClosureRules, DEFAULT_CLOSURE_RULES } from "./config";
export type { ClosureRulesConfig, ClosureTermType } from "./config";
export { computeClosesAt, parseExplicitDateFromText } from "./closes-at";
export type { ClosureHint } from "./closes-at";
export { buildUserPrompt, SYSTEM_PROMPT } from "./prompts";
export { parseGeneratedEvents, validateGeneratedEvent } from "./schema";
export type { GeneratedEvent, GenerateEventsOptions, AllowedCategory } from "./types";
export { ALLOWED_CATEGORIES } from "./types";
export {
  createEventsFromGenerated,
  getEventGeneratorUserId,
  normalizeTitle,
  validateEventPayload,
} from "./create-events";
export type { CreateEventsResult, ValidationResult } from "./create-events";
export { runPipeline } from "./run-pipeline";
export type { RunPipelineOptions, PipelineResult } from "./run-pipeline";
