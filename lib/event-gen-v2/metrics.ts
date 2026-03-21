/**
 * Event Gen v2.0 - Pipeline metrics aggregation
 */

import type { PrismaClient } from '@prisma/client';

export interface PipelineMetrics {
  markets_generated_count: number;
  markets_rejected_count: number;
  avg_quality_score: number | null;
  active_markets_count: number;
  image_generation_success_rate: number | null;
}

export interface PipelineMetricsParams {
  /** Hours to look back for pipeline runs (default 24) */
  hoursBack?: number;
}

/**
 * Aggregates pipeline metrics from PipelineRun and Event tables.
 * Returns zeros when PipelineRun table does not exist (migration not applied).
 */
export async function getPipelineMetrics(
  prisma: PrismaClient,
  params: PipelineMetricsParams = {}
): Promise<PipelineMetrics> {
  const { hoursBack = 24 } = params;
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  type RunRow = {
    createdCount: number;
    rulebookRejectedCount: number;
    skippedCount: number;
    reasonsCount: unknown;
    avgQualityScore: number | null;
  };
  let runs: RunRow[] = [];
  try {
    runs = (await prisma.pipelineRun.findMany({
      where: { startedAt: { gte: since }, dryRun: false },
      select: {
        createdCount: true,
        rulebookRejectedCount: true,
        skippedCount: true,
        reasonsCount: true,
        avgQualityScore: true,
      },
    })) as RunRow[];
  } catch {
    // PipelineRun table may not exist
    runs = [];
  }

  const [activeCount, imageStats] = await Promise.all([
    prisma.event.count({
      where: {
        status: 'OPEN',
        sourceType: 'NEWS',
        generatorVersion: '2.0',
      },
    }),
    prisma.event.groupBy({
      by: ['imageGenerationStatus'],
      where: {
        generatorVersion: '2.0',
        imageGenerationStatus: { in: ['SUCCESS', 'FAILED'] },
      },
      _count: { id: true },
    }),
  ]);

  const markets_generated_count = runs.reduce((sum, r) => sum + r.createdCount, 0);

  const markets_rejected_count = runs.reduce(
    (sum, r) => sum + r.rulebookRejectedCount + r.skippedCount,
    0
  );

  const qualityScores = runs.flatMap((r) => (r.avgQualityScore != null ? [r.avgQualityScore] : []));
  const avg_quality_score =
    qualityScores.length > 0
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
      : null;

  const successCount =
    imageStats.find((s) => s.imageGenerationStatus === 'SUCCESS')?._count.id ?? 0;
  const failedCount =
    imageStats.find((s) => s.imageGenerationStatus === 'FAILED')?._count.id ?? 0;
  const total = successCount + failedCount;
  const image_generation_success_rate = total > 0 ? successCount / total : null;

  return {
    markets_generated_count,
    markets_rejected_count,
    avg_quality_score,
    active_markets_count: activeCount,
    image_generation_success_rate,
  };
}

/**
 * Image generation success rate for events with generatorVersion 2.0
 */
export async function getImageGenerationSuccessRate(
  prisma: PrismaClient
): Promise<number | null> {
  const stats = await prisma.event.groupBy({
    by: ['imageGenerationStatus'],
    where: {
      generatorVersion: '2.0',
      imageGenerationStatus: { in: ['SUCCESS', 'FAILED'] },
    },
    _count: { id: true },
  });

  const successCount = stats.find((s) => s.imageGenerationStatus === 'SUCCESS')?._count.id ?? 0;
  const failedCount = stats.find((s) => s.imageGenerationStatus === 'FAILED')?._count.id ?? 0;
  const total = successCount + failedCount;
  return total > 0 ? successCount / total : null;
}
