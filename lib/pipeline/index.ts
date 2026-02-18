/**
 * Pipeline V2 - Clean event generation pipeline
 * 
 * Main exports for the event generation pipeline
 */

export { runPipelineV2 } from "./runPipelineV2";
export { validateEvent, validateEvents } from "./validation";
export type {
  EventInput,
  EventCreationResult,
  PipelineResult,
  PipelineOptions,
  ValidationResult,
} from "./types";
