/**
 * Schema Zod per validare l'output dell'LLM prima di usarlo.
 * Garantisce che GeneratedEvent rispetti i campi richiesti dall'API admin/events.
 */

import { z } from "zod";
import { ALLOWED_CATEGORIES } from "./types";

const allowedCategoryEnum = z.enum([
  "Sport",
  "Politica",
  "Tecnologia",
  "Economia",
  "Cultura",
  "Scienza",
  "Intrattenimento",
]);

/** Schema per un singolo evento generato (risposta LLM). closesAt può essere sovrascritto da computeClosesAt (Fase 4). */
export const generatedEventSchema = z.object({
  title: z.string().min(1, "title obbligatorio"),
  description: z.string().nullable(),
  category: allowedCategoryEnum,
  closesAt: z.string().min(1, "closesAt obbligatorio"), // ISO 8601 (usato come fallback; computeClosesAt può sovrascrivere)
  resolutionSourceUrl: z.string().url("resolutionSourceUrl deve essere un URL valido"),
  resolutionNotes: z.string().min(1, "resolutionNotes obbligatorie"),
  // Fase 4: hint opzionali per scadenza variabile (breve vs medio termine)
  eventDate: z.string().optional().nullable(), // Data dell'evento se nota (ISO 8601); closesAt sarà 1h prima
  type: z.enum(["shortTerm", "mediumTerm"]).optional().nullable(), // shortTerm 1–7 giorni, mediumTerm 1–4 settimane
});

/** Schema per la risposta dell'LLM: array di eventi (o oggetto con chiave "events"). */
const llmResponseSchema = z.union([
  z.array(generatedEventSchema),
  z.object({ events: z.array(generatedEventSchema) }),
]);

export type GeneratedEventParsed = z.infer<typeof generatedEventSchema>;

/**
 * Estrae e normalizza un array di GeneratedEvent dalla risposta grezza dell'LLM.
 * Accetta sia array diretto sia { events: [...] }.
 */
export function parseGeneratedEvents(raw: unknown): GeneratedEventParsed[] {
  const parsed = llmResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Validazione fallita: ${parsed.error.message}`);
  }
  const data = parsed.data;
  return Array.isArray(data) ? data : data.events;
}

/**
 * Valida e normalizza un singolo evento (es. dopo estrazione da JSON malformato).
 */
export function validateGeneratedEvent(event: unknown): GeneratedEventParsed {
  return generatedEventSchema.parse(event);
}
