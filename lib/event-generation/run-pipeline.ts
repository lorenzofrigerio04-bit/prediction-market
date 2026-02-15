/**
 * Fase 6: Pipeline end-to-end per generazione eventi.
 * Esegue in sequenza: fetch trending → verify → generate (LLM) → create in DB.
 * Usato dal cron GET /api/cron/generate-events.
 */

import type { PrismaClient } from "@prisma/client";
import { fetchTrendingCandidates } from "@/lib/event-sources";
import { verifyCandidates, getVerificationConfigFromEnv } from "@/lib/event-verification";
import { generateEventsFromCandidates } from "./generate";
import { createEventsFromGenerated } from "./create-events";
import type { CreateEventsResult } from "./create-events";
import type { GenerateEventsOptions } from "./types";

export type RunPipelineOptions = {
  /** Numero massimo di candidati da fetch (Fase 1). Default 50. */
  limit?: number;
  /** Opzioni per generateEventsFromCandidates: maxPerCategory, maxTotal, ecc. */
  generation?: GenerateEventsOptions;
};

export type PipelineResult = {
  candidatesCount: number;
  verifiedCount: number;
  generatedCount: number;
  createResult: CreateEventsResult;
};

const DEFAULT_LIMIT = 80;
const DEFAULT_MAX_PER_CATEGORY = 8;
const DEFAULT_MAX_TOTAL = 40;

/**
 * Esegue la pipeline completa: fetch → verify → generate → create.
 *
 * @param prisma - Client Prisma per createEventsFromGenerated
 * @param options - limit (candidati da fetch), generation (maxPerCategory, maxTotal)
 * @returns Metriche: candidatesCount, verifiedCount, generatedCount, createResult
 */
export async function runPipeline(
  prisma: PrismaClient,
  options?: RunPipelineOptions
): Promise<PipelineResult> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const genOpts: GenerateEventsOptions = {
    maxPerCategory: options?.generation?.maxPerCategory ?? DEFAULT_MAX_PER_CATEGORY,
    maxTotal: options?.generation?.maxTotal ?? DEFAULT_MAX_TOTAL,
    maxRetries: options?.generation?.maxRetries ?? 2,
    provider: options?.generation?.provider,
  };

  const candidates = await fetchTrendingCandidates(limit);
  const candidatesCount = candidates.length;

  const verificationConfig = getVerificationConfigFromEnv();
  const verified = verifyCandidates(candidates, verificationConfig);
  const verifiedCount = verified.length;

  const generated =
    verifiedCount > 0
      ? await generateEventsFromCandidates(verified, genOpts)
      : [];
  const generatedCount = generated.length;

  const createResult = await createEventsFromGenerated(prisma, generated);

  return {
    candidatesCount,
    verifiedCount,
    generatedCount,
    createResult,
  };
}
