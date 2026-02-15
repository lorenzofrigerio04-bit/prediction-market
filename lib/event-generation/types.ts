/**
 * Tipi per la generazione eventi con LLM (Fase 3).
 * Output strutturato pronto per la creazione di Event (title, description, category, closesAt, resolutionSourceUrl, resolutionNotes).
 */

/** Categorie ammesse sulla piattaforma (allineate a category-icons e seed). */
export const ALLOWED_CATEGORIES = [
  "Sport",
  "Politica",
  "Tecnologia",
  "Economia",
  "Cultura",
  "Scienza",
  "Intrattenimento",
] as const;

export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

/** Evento generato dall'LLM, validato e pronto per POST /api/admin/events. */
export type GeneratedEvent = {
  title: string;
  description: string | null;
  category: AllowedCategory;
  closesAt: string; // ISO 8601
  resolutionSourceUrl: string;
  resolutionNotes: string;
};

/** Opzioni per generateEventsFromCandidates. */
export type GenerateEventsOptions = {
  /** Massimo eventi per categoria per run (default 3). */
  maxPerCategory?: number;
  /** Numero massimo totale di eventi da generare (default: nessun limite oltre i cap per categoria). */
  maxTotal?: number;
  /** Numero massimo di retry per singola chiamata LLM in caso di JSON non valido (default 2). */
  maxRetries?: number;
  /** Provider: "openai" | "anthropic". Default da env GENERATION_PROVIDER o "openai". */
  provider?: "openai" | "anthropic";
};
