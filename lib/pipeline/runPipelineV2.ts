/**
 * Pipeline V2 Orchestrator
 *
 * MDE-only: delega sempre a runEventGenV2Pipeline.
 * ENABLE_LEGACY_PIPELINE_V2 è deprecato e non riattiva più il path legacy.
 */

import type { PrismaClient } from '@prisma/client';
import { runEventGenV2Pipeline } from '../event-gen-v2';
import type { PublishResult } from '../event-publishing';

export interface RunPipelineV2Params {
  prisma: PrismaClient;
  now?: Date;
  dryRun?: boolean;
}

export interface PipelineDebugInfo {
  sourceArticlesCount?: number;
  sourceClustersCount?: number;
  eligibleStorylinesCount: number;
  candidatesGeneratedCount: number;
  verifiedCandidatesCount: number;
  dedupedCandidatesCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  topRejectionReasons: Record<string, number>;
  sampleEligibleStorylines: Array<{
    id: string;
    signalsCount: number;
    authorityType: string;
    authorityHost: string;
    momentum: number;
    novelty: number;
  }>;
  sampleCandidates: Array<{
    title: string;
    score: number;
    category: string;
    closesAt: string;
    authorityHost: string;
    templateId: string;
    storylineId: string;
    dedupKey?: string;
  }>;
  clustersLoadedCount?: number;
  clustersAfterLookbackCount?: number;
  storylineExclusionReasons?: Record<string, number>;
  openEventsCount?: number;
  targetOpenEvents?: number;
  need?: number;
  duplicatesInDBCount?: number;
  duplicatesInRunCount?: number;
  candidateRejectionReasons?: Record<string, number>;
  templateIdDistribution?: Record<string, number>;
  categoryDistribution?: Record<string, number>;
  zeroSelectedReason?: string;
}

/**
 * Esegue la pipeline V2 (MDE-only: sempre runEventGenV2Pipeline).
 */
export async function runPipelineV2(
  params: RunPipelineV2Params
): Promise<PublishResult & { debugInfo?: PipelineDebugInfo }> {
  const { prisma, now = new Date(), dryRun = false } = params;
  const debug = process.env.PIPELINE_DEBUG === 'true';

  if (debug && process.env.NODE_ENV !== 'test') {
    console.info('[Pipeline V2] path=mde_only delegating to runEventGenV2Pipeline');
  }

  const result = await runEventGenV2Pipeline({ prisma, now, dryRun });
  const mapped: PublishResult = {
    eligibleStorylinesCount: result.eligibleStorylinesCount,
    candidatesCount: result.candidatesCount,
    verifiedCandidatesCount: result.rulebookValidCount,
    dedupedCandidatesCount: result.dedupedCandidatesCount,
    selectedCount: result.selectedCount,
    createdCount: result.createdCount,
    skippedCount: result.skippedCount,
    reasonsCount: result.reasonsCount,
  };
  return {
    ...mapped,
    debugInfo: {
      eligibleStorylinesCount: result.eligibleStorylinesCount,
      candidatesGeneratedCount: result.candidatesCount,
      verifiedCandidatesCount: result.rulebookValidCount,
      dedupedCandidatesCount: result.dedupedCandidatesCount,
      selectedCount: result.selectedCount,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      topRejectionReasons: result.reasonsCount,
      sampleEligibleStorylines: [],
      sampleCandidates: [],
    },
  };
}
