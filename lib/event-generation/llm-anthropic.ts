/**
 * Client LLM tramite Anthropic. Chiamata, parsing JSON, retry su risposta non valida.
 */

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { parseGeneratedEvents } from "./schema";
import type { GeneratedEvent } from "./types";
import type { VerifiedCandidate } from "../event-verification/types";

function extractJsonFromResponse(content: string): unknown {
  const trimmed = content.trim();
  const jsonBlock = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(jsonBlock) as unknown;
}

export async function generateEventWithAnthropic(
  client: Anthropic,
  candidate: VerifiedCandidate,
  config: { model: string; maxRetries: number }
): Promise<GeneratedEvent | null> {
  const userPrompt = buildUserPrompt({
    title: candidate.title,
    snippet: candidate.snippet ?? "",
    url: candidate.url,
    sourceName: candidate.sourceName,
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const message = await client.messages.create({
        model: config.model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const block = message.content.find((b) => b.type === "text");
      const text = block && block.type === "text" ? block.text : "";
      if (!text) {
        lastError = new Error("Risposta Anthropic vuota");
        continue;
      }

      const raw = extractJsonFromResponse(text);
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
      };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < config.maxRetries) continue;
    }
  }
  throw lastError ?? new Error("Generazione fallita dopo retry");
}
