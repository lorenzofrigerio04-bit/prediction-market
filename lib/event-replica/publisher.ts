import type { PrismaClient } from "@prisma/client";
import { validateCandidates } from "@/lib/event-gen-v2/rulebook-validator";
import { scoreCandidates } from "@/lib/event-publishing/scoring";
import { dedupCandidates, publishSelectedV2 } from "@/lib/event-gen-v2/publisher";
import type { ReplicaCandidate } from "./types";
import { getReplicaPipelineConfig } from "./config";

export async function publishReplicaCandidates(params: {
  prisma: PrismaClient;
  now: Date;
  candidates: ReplicaCandidate[];
  maxTotal?: number;
  dryRun?: boolean;
}): Promise<{
  rulebookValidCount: number;
  rulebookRejectedCount: number;
  dedupedCandidatesCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
  eventIds: string[];
}> {
  const { prisma, now, candidates, maxTotal, dryRun = false } = params;
  const cfg = getReplicaPipelineConfig();

  const validated = validateCandidates(candidates);
  const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
  for (const c of validated.valid) {
    storylineStatsMap.set(c.sourceStorylineId, {
      momentum: c.momentum ?? 60,
      novelty: c.novelty ?? 40,
    });
  }
  const scored = scoreCandidates(validated.valid, storylineStatsMap);
  const deduped = await dedupCandidates(prisma, scored);
  const selectedByQuality = deduped.deduped
    .filter((candidate) => {
      const overall = candidate.overall_score ?? candidate.score / 100;
      return overall >= cfg.qualityThreshold;
    })
    .sort((a, b) => (b.overall_score ?? b.score / 100) - (a.overall_score ?? a.score / 100));

  const selected = selectedByQuality.slice(0, maxTotal ?? selectedByQuality.length);

  let createdCount = 0;
  let skippedCount = 0;
  let reasonsCount: Record<string, number> = {
    ...validated.rejectionReasons,
    ...deduped.reasonsCount,
  };
  let eventIds: string[] = [];

  if (selected.length < deduped.deduped.length) {
    reasonsCount.low_quality_threshold =
      (reasonsCount.low_quality_threshold ?? 0) +
      (deduped.deduped.length - selected.length);
  }

  if (!dryRun && selected.length > 0) {
    const publishResult = await publishSelectedV2(prisma, selected, now, {
      sourceType: "NEWS",
    });
    createdCount = publishResult.createdCount;
    skippedCount = publishResult.skippedCount;
    eventIds = publishResult.eventIds ?? [];
    reasonsCount = { ...reasonsCount, ...publishResult.reasonsCount };
  }

  return {
    rulebookValidCount: validated.valid.length,
    rulebookRejectedCount: validated.rejected.length,
    dedupedCandidatesCount: deduped.deduped.length,
    selectedCount: selected.length,
    createdCount,
    skippedCount,
    reasonsCount,
    eventIds,
  };
}
