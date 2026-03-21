/**
 * Event Gen v2.0 Pipeline Orchestrator
 *
 * Flow: Trend Detector → Candidate Generator → Title Engine (in candidate) →
 *       Rulebook Validator → Quality Scoring → Dedup → Select → Publisher
 *
 * Canonical path: When USE_DISCOVERY_BACKED_PIPELINE=true, the discovery-backed flow is
 * the target canonical path (getDiscoveryBackedEventLeads → runDiscoveryBackedPipelineFromLeads
 * → EventLead → SourceObservation → MDE pipeline → validate/score/dedup/select/publish).
 *
 * Legacy paths (temporary): When the flag is not set, storyline path or CANDIDATE_EVENT_GEN
 * (trend) path run instead. These remain until discovery is default.
 *
 * When CANDIDATE_EVENT_GEN=true: uses TrendObjects from Trend Detection Engine instead of storylines.
 * When USE_DISCOVERY_BACKED_PIPELINE=true: uses EventLeads from getDiscoveryBackedEventLeads()
 * (stub returns [] until lead supplier is implemented), then runDiscoveryBackedPipelineFromLeads.
 */

import type { PrismaClient } from '@prisma/client';
import { getEligibleStorylines } from '../storyline-engine';
import { generateCandidates } from './candidate-generator';
import { validateCandidates } from './rulebook-validator';
import { scoreCandidates } from '../event-publishing/scoring';
import {
  dedupCandidates,
  selectCandidatesWithInfo,
  publishSelectedV2,
  computeDedupKey,
} from './publisher';
import { getTrends } from '../trend-detection';
import {
  generateCandidateEvents,
  toPipelineCandidate,
} from '../candidate-event-generator';
import { generateEventsFromTrends } from '../ai-event-generator';
import {
  createRunId,
  onPipelineStart,
  onPipelineComplete,
  onPipelineError,
  onStageComplete,
} from './observability';
import { runDiscoveryBackedEventGenPath } from './discovery-backed-integration';
import { ensureTitlesForMarket } from '../psychological-title-engine';

export interface RunEventGenV2Params {
  prisma: PrismaClient;
  now?: Date;
  dryRun?: boolean;
  /** Cap events created in this run (passed to selection as maxNewPerRun). e.g. 1–20 */
  maxTotal?: number;
}

export interface EventGenV2Result {
  eligibleStorylinesCount: number;
  candidatesCount: number;
  rulebookValidCount: number;
  rulebookRejectedCount: number;
  dedupedCandidatesCount: number;
  selectedCount: number;
  createdCount: number;
  skippedCount: number;
  reasonsCount: Record<string, number>;
  /** Set when USE_DISCOVERY_BACKED_PIPELINE path ran */
  discoveryBacked?: true;
  leadCount?: number;
  conversionCount?: number;
  observationIds?: string[];
  publishableFromDiscovery?: number;
  /** Selection diagnostics when selectedCount === 0 (deduped→select drop) */
  openEventsCount?: number;
  targetOpenEvents?: number;
  need?: number;
  zeroSelectedReason?: 'NEED_ZERO' | 'ALL_FAILED_QUALITY' | 'ALL_FILTERED_BY_CAPS';
  /** Discovery path: quali fonti sono state usate, quante ok/ko (sourcesAttempted, sourcesSucceeded, sourcesFailed, sourceFailures) */
  discoveryReport?: {
    sourcesAttempted: number;
    sourcesSucceeded: number;
    sourcesFailed: number;
    sourceFailures: Array<{ sourceKey: string; reason: string }>;
    normalizedItemsCount: number;
    eventLeadCount: number;
  };
  /** ID eventi creati in questa run (per verifica read-after-write) */
  eventIds?: string[];
}

export async function runEventGenV2Pipeline(
  params: RunEventGenV2Params
): Promise<EventGenV2Result> {
  const { prisma, now = new Date(), dryRun = false } = params;

  if (process.env.DISABLE_EVENT_GENERATION === 'true') {
    return {
      eligibleStorylinesCount: 0,
      candidatesCount: 0,
      rulebookValidCount: 0,
      rulebookRejectedCount: 0,
      dedupedCandidatesCount: 0,
      selectedCount: 0,
      createdCount: 0,
      skippedCount: 0,
      reasonsCount: {},
    };
  }

  const runId = createRunId();
  onPipelineStart(runId, dryRun);
  // Canonical path when set; otherwise legacy storyline or CANDIDATE_EVENT_GEN (trend) path.
  const useDiscoveryBacked = process.env.USE_DISCOVERY_BACKED_PIPELINE === 'true';
  const useCandidateEventGen = process.env.CANDIDATE_EVENT_GEN === 'true';
  const maxTotal = params.maxTotal;

  try {
    if (useDiscoveryBacked) {
      return await runDiscoveryBackedEventGenPath({ prisma, now, dryRun, runId, maxTotal });
    }
    const result = useCandidateEventGen
      ? await runCandidateEventGenPipeline({ prisma, now, dryRun, runId, maxTotal })
      : await runStorylinePipeline({ prisma, now, dryRun, runId, maxTotal });
    return result;
  } catch (error) {
    onPipelineError(runId, error);
    throw error;
  }
}

/** Persist pipeline run to PipelineRun table for metrics/audit */
async function persistPipelineRun(
  prisma: PrismaClient,
  runId: string,
  source: 'storyline' | 'trend',
  result: EventGenV2Result,
  options: { dryRun: boolean; eventIds: string[]; avgQualityScore?: number; startedAt: number }
): Promise<void> {
  try {
    const completedAt = new Date();
    const startedAtDate = new Date(options.startedAt);
    await prisma.pipelineRun.create({
      data: {
        runId,
        startedAt: startedAtDate,
        completedAt,
        dryRun: options.dryRun,
        source,
        eligibleCount: result.eligibleStorylinesCount,
        candidatesCount: result.candidatesCount,
        rulebookValidCount: result.rulebookValidCount,
        rulebookRejectedCount: result.rulebookRejectedCount,
        dedupedCount: result.dedupedCandidatesCount,
        selectedCount: result.selectedCount,
        createdCount: result.createdCount,
        skippedCount: result.skippedCount,
        reasonsCount: result.reasonsCount as object,
        eventIds: options.eventIds,
        avgQualityScore: options.avgQualityScore ?? null,
      },
    });
  } catch (err) {
    console.warn('[Event Gen v2] Failed to persist PipelineRun:', err);
  }
}

/** Compute avg quality score from selected candidates */
function computeAvgQualityScore(
  selected: Array<{ qualityScores?: { overall_score?: number } | null; overall_score?: number; score?: number }>
): number | undefined {
  const scores = selected
    .map((c) => c.qualityScores?.overall_score ?? c.overall_score ?? (c.score != null ? c.score / 100 : undefined))
    .filter((s): s is number => typeof s === 'number');
  if (scores.length === 0) return undefined;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Pipeline path: TrendObjects → Candidate Event Generator → validate → score → publish
 */
async function runCandidateEventGenPipeline(params: {
  prisma: PrismaClient;
  now: Date;
  dryRun: boolean;
  runId: string;
  maxTotal?: number;
}): Promise<EventGenV2Result> {
  const { prisma, now, dryRun, runId, maxTotal } = params;
  const debug = process.env.PIPELINE_DEBUG === 'true';
  const startedAt = Date.now();

  const result: EventGenV2Result = {
    eligibleStorylinesCount: 0,
    candidatesCount: 0,
    rulebookValidCount: 0,
    rulebookRejectedCount: 0,
    dedupedCandidatesCount: 0,
    selectedCount: 0,
    createdCount: 0,
    skippedCount: 0,
    reasonsCount: {},
  };

  try {
    const { trends } = await getTrends({ limit: 50, skipCache: false });
    result.eligibleStorylinesCount = trends.length;
    onStageComplete(runId, 'trend', {
      eligibleCount: trends.length,
      source: 'trend',
    });

    if (trends.length === 0) {
      if (debug) console.log('[Candidate Event Gen] No trends');
      persistPipelineRun(prisma, runId, 'trend', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'trend', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const useAI = process.env.AI_EVENT_GENERATOR === 'true';
    let candidates;

    if (useAI) {
      const aiResult = await generateEventsFromTrends(trends, now);
      candidates = aiResult.candidates;
      Object.assign(result.reasonsCount, aiResult.rejectionCounts);
    } else {
      const genResult = generateCandidateEvents(trends, now);
      const structuredCandidates = genResult.candidates;
      Object.assign(result.reasonsCount, genResult.rejectionCounts as Record<string, number>);
      candidates = structuredCandidates.map((ev) => toPipelineCandidate(ev));
    }

    result.candidatesCount = candidates.length;
    onStageComplete(runId, 'candidate', {
      candidatesCount: candidates.length,
      rejectionReasons: result.reasonsCount,
    });
    await ensureTitlesForMarket(candidates);
    if (candidates.length === 0) {
      if (debug) console.log('[Candidate Event Gen] No candidates generated');
      persistPipelineRun(prisma, runId, 'trend', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'trend', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const validationResult = validateCandidates(candidates);
    const validCandidates = validationResult.valid;
    result.rulebookValidCount = validCandidates.length;
    result.rulebookRejectedCount = validationResult.rejected.length;
    for (const [k, v] of Object.entries(validationResult.rejectionReasons)) {
      result.reasonsCount[k] = (result.reasonsCount[k] ?? 0) + v;
    }
    onStageComplete(runId, 'validator', {
      validCount: validCandidates.length,
      rejectedCount: validationResult.rejected.length,
      rejectionReasons: validationResult.rejectionReasons,
    });

    if (validCandidates.length === 0) {
      if (debug) console.log('[Candidate Event Gen] All candidates rejected by rulebook');
      persistPipelineRun(prisma, runId, 'trend', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'trend', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const trendScoreByTopic = new Map(trends.map((t) => [t.topic, t.trend_score]));
    const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
    for (const c of candidates) {
      const topic = c.sourceStorylineId.replace(/^trend:/, '');
      const score = (trendScoreByTopic.get(topic) ?? 0.5) * 100;
      storylineStatsMap.set(c.sourceStorylineId, { momentum: score, novelty: score });
    }
    const scored = scoreCandidates(validCandidates, storylineStatsMap);

    const { deduped, reasonsCount: dedupReasons } = await dedupCandidates(prisma, scored);
    result.dedupedCandidatesCount = deduped.length;
    Object.assign(result.reasonsCount, dedupReasons);

    if (deduped.length === 0) {
      if (debug) console.log('[Candidate Event Gen] All candidates deduped');
      persistPipelineRun(prisma, runId, 'trend', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'trend', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const selectionInfo = await selectCandidatesWithInfo(prisma, deduped, now, {
      maxNewPerRun: maxTotal,
    });
    const selected = selectionInfo.selected;
    result.selectedCount = selected.length;
    const avgQualityScore = computeAvgQualityScore(selected);
    onStageComplete(runId, 'scoring', {
      scoredCount: deduped.length,
      avgOverallScore: avgQualityScore,
    });

    if (selected.length === 0) {
      if (debug) console.log('[Candidate Event Gen] No candidates selected');
      persistPipelineRun(prisma, runId, 'trend', result, { dryRun, eventIds: [], avgQualityScore, startedAt });
      onPipelineComplete(runId, result, { source: 'trend', dryRun, eventIds: [], avgQualityScore, durationMs: Date.now() - startedAt });
      return result;
    }

    let eventIds: string[] = [];
    if (!dryRun) {
      const publishResult = await publishSelectedV2(prisma, selected, now);
      result.createdCount = publishResult.createdCount;
      result.skippedCount = publishResult.skippedCount;
      Object.assign(result.reasonsCount, publishResult.reasonsCount);
      eventIds = publishResult.eventIds ?? [];
    } else if (debug) {
      console.log('[Candidate Event Gen] DRY RUN: would publish', selected.length, 'events');
    }
    onStageComplete(runId, 'publish', {
      selectedCount: selected.length,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      eventIds,
    });

    result.eventIds = eventIds;
    persistPipelineRun(prisma, runId, 'trend', result, { dryRun, eventIds, avgQualityScore, startedAt });
    onPipelineComplete(runId, result, { source: 'trend', dryRun, eventIds, avgQualityScore, durationMs: Date.now() - startedAt });
    if (debug) console.log('[Candidate Event Gen] Summary:', result);
    return result;
  } catch (error) {
    console.error('[Candidate Event Gen] Error:', error);
    throw error;
  }
}

/**
 * Pipeline path: Storylines → Candidate Generator → validate → score → publish (original)
 */
async function runStorylinePipeline(params: {
  prisma: PrismaClient;
  now: Date;
  dryRun: boolean;
  runId: string;
  maxTotal?: number;
}): Promise<EventGenV2Result> {
  const { prisma, now, dryRun, runId, maxTotal } = params;
  const debug = process.env.PIPELINE_DEBUG === 'true';
  const startedAt = Date.now();

  const result: EventGenV2Result = {
    eligibleStorylinesCount: 0,
    candidatesCount: 0,
    rulebookValidCount: 0,
    rulebookRejectedCount: 0,
    dedupedCandidatesCount: 0,
    selectedCount: 0,
    createdCount: 0,
    skippedCount: 0,
    reasonsCount: {},
  };

  try {
    // Step 1: Trend Detector (eligible storylines)
    const storylineResult = await getEligibleStorylines({
      prisma,
      now,
      lookbackHours: 168,
    });
    const eligible = storylineResult.eligible;
    result.eligibleStorylinesCount = eligible.length;
    onStageComplete(runId, 'trend', {
      eligibleCount: eligible.length,
      source: 'storyline',
    });

    if (eligible.length === 0) {
      if (debug) console.log('[Event Gen v2] No eligible storylines');
      persistPipelineRun(prisma, runId, 'storyline', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'storyline', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    // Step 2: Candidate Generator + Title Engine (templates)
    const genResult = await generateCandidates({ prisma, now, eligible });
    const candidates = genResult.candidates;
    result.candidatesCount = candidates.length;
    Object.assign(result.reasonsCount, genResult.rejectionReasons);
    onStageComplete(runId, 'candidate', {
      candidatesCount: candidates.length,
      rejectionReasons: genResult.rejectionReasons,
    });
    await ensureTitlesForMarket(candidates);

    if (candidates.length === 0) {
      if (debug) console.log('[Event Gen v2] No candidates generated');
      persistPipelineRun(prisma, runId, 'storyline', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'storyline', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    // Step 3: Rulebook Validator
    const validationResult = validateCandidates(candidates);
    const validCandidates = validationResult.valid;
    result.rulebookValidCount = validCandidates.length;
    result.rulebookRejectedCount = validationResult.rejected.length;
    for (const [k, v] of Object.entries(validationResult.rejectionReasons)) {
      result.reasonsCount[k] = (result.reasonsCount[k] ?? 0) + v;
    }
    onStageComplete(runId, 'validator', {
      validCount: validCandidates.length,
      rejectedCount: validationResult.rejected.length,
      rejectionReasons: validationResult.rejectionReasons,
    });

    if (validCandidates.length === 0) {
      if (debug) console.log('[Event Gen v2] All candidates rejected by rulebook');
      persistPipelineRun(prisma, runId, 'storyline', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'storyline', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    // Step 4: Quality Scoring
    const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
    for (const s of eligible) {
      storylineStatsMap.set(s.clusterId, {
        momentum: s.momentum,
        novelty: s.novelty,
      });
    }
    const scored = scoreCandidates(validCandidates, storylineStatsMap);

    // Step 5: Dedup
    const { deduped, reasonsCount: dedupReasons } = await dedupCandidates(prisma, scored);
    result.dedupedCandidatesCount = deduped.length;
    Object.assign(result.reasonsCount, dedupReasons);

    if (deduped.length === 0) {
      if (debug) console.log('[Event Gen v2] All candidates deduped');
      persistPipelineRun(prisma, runId, 'storyline', result, { dryRun, eventIds: [], avgQualityScore: undefined, startedAt });
      onPipelineComplete(runId, result, { source: 'storyline', dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    // Step 6: Select
    const selectionInfo = await selectCandidatesWithInfo(prisma, deduped, now, {
      maxNewPerRun: maxTotal,
    });
    const selected = selectionInfo.selected;
    result.selectedCount = selected.length;
    const avgQualityScore = computeAvgQualityScore(selected);
    onStageComplete(runId, 'scoring', {
      scoredCount: deduped.length,
      avgOverallScore: avgQualityScore,
    });

    if (selected.length === 0) {
      if (debug) console.log('[Event Gen v2] No candidates selected');
      persistPipelineRun(prisma, runId, 'storyline', result, { dryRun, eventIds: [], avgQualityScore, startedAt });
      onPipelineComplete(runId, result, { source: 'storyline', dryRun, eventIds: [], avgQualityScore, durationMs: Date.now() - startedAt });
      return result;
    }

    // Step 7: Publish (or dry-run)
    let eventIds: string[] = [];
    if (!dryRun) {
      const publishResult = await publishSelectedV2(prisma, selected, now);
      result.createdCount = publishResult.createdCount;
      result.skippedCount = publishResult.skippedCount;
      Object.assign(result.reasonsCount, publishResult.reasonsCount);
      eventIds = publishResult.eventIds ?? [];
    } else {
      if (debug) {
        console.log('[Event Gen v2] DRY RUN: would publish', selected.length, 'events');
        for (const c of selected.slice(0, 5)) {
          try {
            const dk = computeDedupKey({
              title: c.title,
              closesAt: c.closesAt,
              resolutionAuthorityHost: c.resolutionAuthorityHost,
            });
            console.log(`  - ${c.title.slice(0, 50)}... dedupKey=${dk.slice(0, 16)}...`);
          } catch {
            console.log(`  - ${c.title.slice(0, 50)}... (no dedupKey)`);
          }
        }
      }
    }
    onStageComplete(runId, 'publish', {
      selectedCount: selected.length,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      eventIds,
    });

    result.eventIds = eventIds;
    persistPipelineRun(prisma, runId, 'storyline', result, { dryRun, eventIds, avgQualityScore, startedAt });
    onPipelineComplete(runId, result, { source: 'storyline', dryRun, eventIds, avgQualityScore, durationMs: Date.now() - startedAt });
    if (debug) {
      console.log('[Event Gen v2] Summary:', result);
    }

    return result;
  } catch (error) {
    console.error('[Event Gen v2] Error:', error);
    throw error;
  }
}
