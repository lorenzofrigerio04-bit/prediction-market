/**
 * Client LLM tramite OpenAI. Chiamata, parsing JSON, retry su risposta non valida.
 */

import OpenAI from "openai";
import { getSystemPrompt, buildUserPrompt } from "./prompts";
import { parseGeneratedEvents } from "./schema";
import type { GenerationConfig } from "./config";
import type { GeneratedEvent } from "./types";
import type { ClosureHint } from "./closes-at";
import type { VerifiedCandidate } from "../event-verification/types";

/** Evento generato con hint opzionali per computeClosesAt (Fase 4). */
export type GeneratedEventWithClosureHints = GeneratedEvent & ClosureHint;

/** Estrae JSON dalla risposta (rimuove eventuali markdown code block). */
function extractJsonFromResponse(content: string): unknown {
  const trimmed = content.trim();
  // Rimuovi ```json ... ``` se presente
  const jsonBlock = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(jsonBlock) as unknown;
}

/**
 * Genera un evento da un singolo candidato verificato usando OpenAI.
 * Ritorna il primo evento valido dall'array restituito dall'LLM (uno candidato → un evento),
 * con eventuali eventDate/type per computeClosesAt (Fase 4).
 */
export async function generateEventWithOpenAI(
  client: OpenAI,
  candidate: VerifiedCandidate,
  config: { model: string; maxRetries: number }
): Promise<GeneratedEventWithClosureHints | null> {
  const userPrompt = buildUserPrompt({
    title: candidate.title,
    snippet: candidate.snippet ?? "",
    url: candidate.url,
    sourceName: candidate.sourceName,
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: "system", content: getSystemPrompt() },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        lastError = new Error("Risposta LLM vuota");
        continue;
      }

      const raw = extractJsonFromResponse(content);
      const events = parseGeneratedEvents(raw);
      const first = events[0];
      if (!first) {
        lastError = new Error("Nessun evento nel JSON");
        continue;
      }
      return {
        title: first.title,
        description: first.description ?? null,
        category: first.category as GeneratedEvent["category"],
        closesAt: first.closesAt,
        resolutionSourceUrl: first.resolutionSourceUrl,
        resolutionNotes: first.resolutionNotes,
        eventDate: first.eventDate ?? null,
        type: first.type ?? null,
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < config.maxRetries) continue;
    }
  }
  throw lastError ?? new Error("Generazione fallita dopo retry");
}
