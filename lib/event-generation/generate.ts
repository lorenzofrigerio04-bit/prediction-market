/**
 * Funzione principale: generateEventsFromCandidates (Fase 3).
 * Da candidati verificati ottiene eventi generati dall'LLM, con cap per categoria e priorità per score.
 */

import https from "node:https";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { VerifiedCandidate } from "../event-verification/types";
import type { GeneratedEvent, GenerateEventsOptions } from "./types";
import { getGenerationConfigFromEnv, getApiKeyForProvider } from "./config";
import { generateEventWithOpenAI } from "./llm-openai";
import { generateEventWithAnthropic } from "./llm-anthropic";
import { computeClosesAt } from "./closes-at";

const DEFAULT_MAX_PER_CATEGORY = 3;

/**
 * Seleziona i candidati da processare rispettando:
 * - priorità per verificationScore (già ordinati in input)
 * - max per categoria (es. max 2-3 per categoria per run)
 * - max totale opzionale
 */
function selectCandidatesWithCaps(
  verifiedCandidates: VerifiedCandidate[],
  options: GenerateEventsOptions
): VerifiedCandidate[] {
  const maxPerCategory = options.maxPerCategory ?? DEFAULT_MAX_PER_CATEGORY;
  const maxTotal = options.maxTotal ?? Infinity;
  const categoryCount = new Map<string, number>();
  const selected: VerifiedCandidate[] = [];

  for (const c of verifiedCandidates) {
    if (selected.length >= maxTotal) break;
    // Usa rawCategory se disponibile, altrimenti non abbiamo categoria prima dell'LLM:
    // l'LLM assegna la categoria. Quindi il "cap per categoria" si applica DOPO la generazione.
    // Strategia alternativa: generare in ordine di score e poi troncare per categoria sui risultati.
    // Per ora selezioniamo i primi N candidati (ordinati per score) e poi dopo la generazione
    // applichiamo il cap per categoria sugli eventi generati.
    selected.push(c);
  }

  return selected;
}

/**
 * Dopo aver generato gli eventi, applica cap per categoria e maxTotal:
 * ordina per "ordine di priorità" (manteniamo l'ordine di generazione che segue lo score)
 * e tronca per rispettare maxPerCategory e maxTotal.
 */
function applyCategoryCaps(
  events: GeneratedEvent[],
  options: GenerateEventsOptions
): GeneratedEvent[] {
  const maxPerCategory = options.maxPerCategory ?? DEFAULT_MAX_PER_CATEGORY;
  const maxTotal = options.maxTotal ?? Infinity;
  const categoryCount = new Map<string, number>();
  const result: GeneratedEvent[] = [];

  for (const e of events) {
    if (result.length >= maxTotal) break;
    const n = categoryCount.get(e.category) ?? 0;
    if (n >= maxPerCategory) continue;
    categoryCount.set(e.category, n + 1);
    result.push(e);
  }
  return result;
}

/**
 * Genera eventi da candidati verificati tramite LLM.
 *
 * - Usa OpenAI o Anthropic in base a options.provider o GENERATION_PROVIDER.
 * - Ordina i candidati per verificationScore (decrescente) e applica maxPerCategory / maxTotal
 *   dopo la generazione (cap per categoria, priorità per trend/score).
 * - Ogni candidato produce al massimo un evento; in caso di errore/retry falliti il candidato viene saltato.
 *
 * @param verifiedCandidates – Candidati già verificati (Fase 2), preferibilmente ordinati per score
 * @param options – maxPerCategory (default 3), maxTotal, maxRetries, provider
 * @returns Array di GeneratedEvent validi, rispettando i cap
 */
export async function generateEventsFromCandidates(
  verifiedCandidates: VerifiedCandidate[],
  options?: GenerateEventsOptions
): Promise<GeneratedEvent[]> {
  const opts = options ?? {};
  const config = getGenerationConfigFromEnv({
    maxRetries: opts.maxRetries,
  });
  const apiKey = getApiKeyForProvider(config);

  // Candidati già ordinati per score da verifyCandidates; limitiamo quanti processare per non eccedere
  // un ragionevole numero di chiamate (maxTotal o un limite implicito da cap categoria).
  const maxTotal = opts.maxTotal ?? 50; // limite sensato per una run se non specificato
  const toProcess = selectCandidatesWithCaps(verifiedCandidates, { ...opts, maxTotal });
  const generated: GeneratedEvent[] = [];

  if (config.provider === "openai") {
    // Workaround SSL solo in sviluppo: UNABLE_TO_GET_ISSUER_CERT_LOCALLY (rete aziendale/VPN).
    // In produzione (Vercel) non si usa mai, anche se GENERATION_INSECURE_SSL fosse impostata per errore.
    const allowInsecureSSL =
      process.env.NODE_ENV !== "production" &&
      process.env.GENERATION_INSECURE_SSL === "1";
    const httpAgent = allowInsecureSSL
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined;
    const client = new OpenAI({ apiKey, httpAgent });
    for (const candidate of toProcess) {
      try {
        const raw = await generateEventWithOpenAI(client, candidate, {
          model: config.model,
          maxRetries: config.maxRetries,
        });
        if (raw) {
          const closure = computeClosesAt(candidate, raw, raw.category);
          if (!closure.ok) {
            console.warn(`Evento scartato (scadenza incoerente): "${raw.title.slice(0, 50)}..." — ${closure.reason}`);
            continue;
          }
          generated.push({
            title: raw.title,
            description: raw.description,
            category: raw.category,
            closesAt: closure.closesAt,
            resolutionSourceUrl: raw.resolutionSourceUrl,
            resolutionNotes: raw.resolutionNotes,
          });
        }
      } catch (err) {
        const isSSL =
          (typeof err === "object" && err !== null && (err as NodeJS.ErrnoException).code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY") ||
          (err instanceof Error && /UNABLE_TO_GET_ISSUER_CERT_LOCALLY/.test(String(err)));
        console.warn(`Generazione saltata per "${candidate.title.slice(0, 50)}...":`, err);
        if (isSSL && process.env.NODE_ENV !== "production") {
          console.warn("💡 Per reti aziendali/VPN imposta in .env.local: GENERATION_INSECURE_SSL=1");
        }
      }
    }
  } else if (config.provider === "anthropic") {
    const client = new Anthropic({ apiKey });
    for (const candidate of toProcess) {
      try {
        const raw = await generateEventWithAnthropic(client, candidate, {
          model: config.model,
          maxRetries: config.maxRetries,
        });
        if (raw) {
          const closure = computeClosesAt(candidate, raw, raw.category);
          if (!closure.ok) {
            console.warn(`Evento scartato (scadenza incoerente): "${raw.title.slice(0, 50)}..." — ${closure.reason}`);
            continue;
          }
          generated.push({
            title: raw.title,
            description: raw.description,
            category: raw.category,
            closesAt: closure.closesAt,
            resolutionSourceUrl: raw.resolutionSourceUrl,
            resolutionNotes: raw.resolutionNotes,
          });
        }
      } catch (err) {
        const isSSL =
          (typeof err === "object" && err !== null && (err as NodeJS.ErrnoException).code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY") ||
          (err instanceof Error && /UNABLE_TO_GET_ISSUER_CERT_LOCALLY/.test(String(err)));
        console.warn(`Generazione saltata per "${candidate.title.slice(0, 50)}...":`, err);
        if (isSSL && process.env.NODE_ENV !== "production") {
          console.warn("💡 Per reti aziendali/VPN imposta in .env.local: GENERATION_INSECURE_SSL=1");
        }
      }
    }
  } else {
    throw new Error(`Provider non supportato: ${config.provider}`);
  }

  return applyCategoryCaps(generated, opts);
}
