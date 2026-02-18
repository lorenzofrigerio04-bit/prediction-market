/**
 * Pipeline V2 Orchestrator (BLOCCO 5)
 * 
 * Orchestra l'intero flusso di generazione eventi:
 * 1. Get eligible storylines (BLOCCO 3)
 * 2. Generate candidates (BLOCCO 4)
 * 3. Score candidates
 * 4. Dedup candidates
 * 5. Select candidates
 * 6. Publish selected
 */

import type { PrismaClient } from '@prisma/client';
import { getEligibleStorylines, type EligibleStoryline } from '../storyline-engine';
import { generateEventsFromEligibleStorylines, type GeneratedEventCandidate } from '../event-generation-v2';
import {
  scoreCandidates,
  dedupCandidates,
  selectCandidates,
  publishSelected,
  type PublishResult,
  type ScoredCandidate,
} from '../event-publishing';

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
  }>;
}

/**
 * Esegue la pipeline V2 completa
 */
export async function runPipelineV2(
  params: RunPipelineV2Params
): Promise<PublishResult & { debugInfo?: PipelineDebugInfo }> {
  const { prisma, now = new Date(), dryRun = false } = params;
  const debug = process.env.PIPELINE_DEBUG === 'true';

  const result: PublishResult = {
    eligibleStorylinesCount: 0,
    candidatesCount: 0,
    verifiedCandidatesCount: 0,
    dedupedCandidatesCount: 0,
    selectedCount: 0,
    createdCount: 0,
    skippedCount: 0,
    reasonsCount: {},
  };

  const debugInfo: PipelineDebugInfo = {
    eligibleStorylinesCount: 0,
    candidatesGeneratedCount: 0,
    verifiedCandidatesCount: 0,
    dedupedCandidatesCount: 0,
    selectedCount: 0,
    createdCount: 0,
    skippedCount: 0,
    topRejectionReasons: {},
    sampleEligibleStorylines: [],
    sampleCandidates: [],
  };

  try {
    // Get source counts if debug enabled
    if (debug) {
      const [sourceArticlesCount, sourceClustersCount] = await Promise.all([
        prisma.sourceArticle.count(),
        prisma.sourceCluster.count(),
      ]);
      debugInfo.sourceArticlesCount = sourceArticlesCount;
      debugInfo.sourceClustersCount = sourceClustersCount;
    }

    // Step 1: Get eligible storylines
    const eligible = await getEligibleStorylines({
      prisma,
      now,
      lookbackHours: 168, // 7 giorni
    });
    result.eligibleStorylinesCount = eligible.length;
    debugInfo.eligibleStorylinesCount = eligible.length;

    if (debug && eligible.length > 0) {
      // Sample eligible storylines (max 5)
      const sample = eligible.slice(0, 5).map(s => ({
        id: s.id,
        signalsCount: s.articleCount,
        authorityType: s.authority >= 80 ? 'OFFICIAL' : s.authority >= 50 ? 'REPUTABLE' : 'UNKNOWN',
        authorityHost: 'N/A', // Will be filled from articles if needed
        momentum: s.momentum,
        novelty: s.novelty,
      }));
      debugInfo.sampleEligibleStorylines = sample;
    }

    if (eligible.length === 0) {
      if (debug) {
        console.log('[Pipeline V2] Nessuna storyline elegibile');
      }
      return { ...result, debugInfo };
    }

    // Step 2: Generate candidates
    const candidates = await generateEventsFromEligibleStorylines({
      prisma,
      now,
      eligible,
    });
    result.candidatesCount = candidates.length;
    result.verifiedCandidatesCount = candidates.length; // Assumiamo che siano già verificati da BLOCCO 4
    debugInfo.candidatesGeneratedCount = candidates.length;
    debugInfo.verifiedCandidatesCount = candidates.length;

    if (candidates.length === 0) {
      if (debug) {
        console.log('[Pipeline V2] Nessun candidato generato');
      }
      return { ...result, debugInfo };
    }

    // Step 3: Score candidates
    // Mappa momentum/novelty dalle storyline ai candidati
    const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
    for (const storyline of eligible) {
      storylineStatsMap.set(storyline.id, {
        momentum: storyline.momentum,
        novelty: storyline.novelty,
      });
    }

    // Se i candidati hanno già momentum/novelty, usali; altrimenti usa la mappa
    const candidatesWithStats: GeneratedEventCandidate[] = candidates.map(candidate => {
      if (candidate.momentum !== undefined && candidate.novelty !== undefined) {
        return candidate;
      }
      const stats = storylineStatsMap.get(candidate.sourceStorylineId);
      if (stats) {
        return {
          ...candidate,
          momentum: stats.momentum,
          novelty: stats.novelty,
        };
      }
      return candidate;
    });

    const scored = scoreCandidates(candidatesWithStats, storylineStatsMap);

    // Debug: top 10 candidates
    if (debug) {
      const top10 = [...scored].sort((a, b) => b.score - a.score).slice(0, 10);
      console.log('[Pipeline V2] Top 10 candidates:');
      top10.forEach((c, i) => {
        console.log(
          `  ${i + 1}. [${c.category}] ${c.title.slice(0, 60)}... ` +
          `Score: ${c.score} (M:${c.scoreBreakdown.momentum} N:${c.scoreBreakdown.novelty} ` +
          `A:${c.scoreBreakdown.authority} C:${c.scoreBreakdown.clarity})`
        );
      });

      // Sample candidates (max 5)
      const sample = top10.slice(0, 5).map(c => ({
        title: c.title,
        score: c.score,
        category: c.category,
        closesAt: c.closesAt.toISOString(),
        authorityHost: c.resolutionAuthorityHost,
        templateId: c.templateId,
        storylineId: c.sourceStorylineId,
      }));
      debugInfo.sampleCandidates = sample;
    }

    // Step 4: Dedup candidates
    const { deduped, reasonsCount: dedupReasons } = await dedupCandidates(prisma, scored);
    result.dedupedCandidatesCount = deduped.length;
    debugInfo.dedupedCandidatesCount = deduped.length;
    Object.assign(result.reasonsCount, dedupReasons);

    // Step 5: Select candidates
    const selected = await selectCandidates(prisma, deduped, now);
    result.selectedCount = selected.length;
    debugInfo.selectedCount = selected.length;

    if (selected.length === 0) {
      if (debug) {
        console.log('[Pipeline V2] Nessun candidato selezionato (target già raggiunto o caps)');
      }
      // Collect top rejection reasons
      const topReasons = Object.entries(result.reasonsCount)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .reduce((acc, [key, value]) => {
          acc[key] = value as number;
          return acc;
        }, {} as Record<string, number>);
      debugInfo.topRejectionReasons = topReasons;
      return { ...result, debugInfo };
    }

    // Step 6: Publish selected (se non dry-run)
    if (!dryRun) {
      const publishResult = await publishSelected(prisma, selected, now);
      result.createdCount = publishResult.createdCount;
      result.skippedCount = publishResult.skippedCount;
      debugInfo.createdCount = publishResult.createdCount;
      debugInfo.skippedCount = publishResult.skippedCount;
      Object.assign(result.reasonsCount, publishResult.reasonsCount);
    } else {
      if (debug) {
        console.log('[Pipeline V2] DRY RUN: non pubblicato nel DB');
      }
    }

    // Collect top rejection reasons
    const topReasons = Object.entries(result.reasonsCount)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .reduce((acc, [key, value]) => {
        acc[key] = value as number;
        return acc;
      }, {} as Record<string, number>);
    debugInfo.topRejectionReasons = topReasons;

    // Debug summary
    if (debug) {
      console.log('[Pipeline V2] Summary:', {
        eligibleStorylinesCount: result.eligibleStorylinesCount,
        candidatesCount: result.candidatesCount,
        dedupedCandidatesCount: result.dedupedCandidatesCount,
        selectedCount: result.selectedCount,
        createdCount: result.createdCount,
        skippedCount: result.skippedCount,
        reasonsCount: result.reasonsCount,
      });
    }

    return { ...result, debugInfo };
  } catch (error) {
    console.error('[Pipeline V2] Error:', error);
    throw error;
  }
}
