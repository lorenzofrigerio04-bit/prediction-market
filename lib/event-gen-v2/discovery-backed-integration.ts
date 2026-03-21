/**
 * Discovery-backed pipeline path: EventLeads → runDiscoveryBackedPipelineFromLeads
 * → pipelineArtifactsToAppCandidate → validate → score → dedup → select → publish.
 *
 * This is the canonical path for event generation when USE_DISCOVERY_BACKED_PIPELINE=true.
 * Storyline and CANDIDATE_EVENT_GEN (trend) paths are legacy alternatives when the flag is not set.
 * Used by runEventGenV2Pipeline; does not create a second downstream pipeline; reuses the same
 * validate/score/dedup/select/publish chain.
 */

import type { PrismaClient } from "@prisma/client";
import { runDiscoveryBackedPipelineFromLeads } from "@/lib/mde-pipeline/run-discovery-backed-pipeline";
import { pipelineArtifactsToAppCandidate } from "@/lib/mde-pipeline/publishable-to-app-candidate";
import { ensureTitlesForMarket } from "@/lib/psychological-title-engine";
import { getAITitleEngineConfig } from "@/lib/ai-title-engine";
import { validateCandidates } from "./rulebook-validator";
import { scoreCandidates } from "../event-publishing/scoring";
import {
  dedupCandidates,
  selectCandidatesWithInfo,
  publishSelectedV2,
} from "./publisher";
import { runDiscoveryLeadSupplier } from "./discovery-lead-supplier";
import { onStageComplete, onPipelineComplete } from "./observability";
import type { EventGenV2Result } from "./run-pipeline";

const DISCOVERY_SOURCE_STORYLINE_ID = "mde-pipeline";
const DEFAULT_MOMENTUM = 80;
const DEFAULT_NOVELTY = 70;

function computeAvgQualityScoreFromSelected(
  selected: Array<{
    qualityScores?: { overall_score?: number } | null;
    overall_score?: number;
    score?: number;
  }>
): number | undefined {
  const scores = selected
    .map((c) => c.qualityScores?.overall_score ?? c.overall_score ?? (c.score != null ? c.score / 100 : undefined))
    .filter((s): s is number => typeof s === "number");
  if (scores.length === 0) return undefined;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

async function persistDiscoveryPipelineRun(
  prisma: PrismaClient,
  runId: string,
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
        source: "discovery",
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
    console.warn("[Discovery-backed] Failed to persist PipelineRun:", err);
  }
}

export interface RunDiscoveryBackedEventGenParams {
  prisma: PrismaClient;
  now: Date;
  dryRun: boolean;
  runId: string;
  maxTotal?: number;
}

/**
 * Runs the discovery-backed path: get leads → run discovery pipeline → map to
 * Candidate[] → validate → score → dedup → select → publish. Returns result
 * compatible with EventGenV2Result plus discovery-specific fields.
 */
export async function runDiscoveryBackedEventGenPath(
  params: RunDiscoveryBackedEventGenParams
): Promise<EventGenV2Result> {
  const { prisma, now, dryRun, runId, maxTotal } = params;
  const debug = process.env.PIPELINE_DEBUG === "true";
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
    discoveryBacked: true,
    leadCount: 0,
    conversionCount: 0,
    observationIds: [],
    publishableFromDiscovery: 0,
  };

  try {
    const supplierResult = await runDiscoveryLeadSupplier();
    const leads = supplierResult.leads;
    result.eligibleStorylinesCount = leads.length;
    result.leadCount = leads.length;
    result.discoveryReport = {
      sourcesAttempted: supplierResult.report.sourcesAttempted,
      sourcesSucceeded: supplierResult.report.sourcesSucceeded,
      sourcesFailed: supplierResult.report.sourcesFailed,
      sourceFailures: supplierResult.report.sourceFailures,
      normalizedItemsCount: supplierResult.report.normalizedItemsCount,
      eventLeadCount: supplierResult.report.eventLeadCount,
    };
    if (debug) {
      console.log("[discovery-lead-supplier]", JSON.stringify(supplierResult.report, null, 2));
    }
    onStageComplete(runId, "trend", {
      eligibleCount: leads.length,
      source: "discovery",
    });

    if (leads.length === 0) {
      if (debug) console.log("[Discovery-backed] No event leads");
      await persistDiscoveryPipelineRun(prisma, runId, result, { dryRun, eventIds: [], startedAt });
      onPipelineComplete(runId, result, { source: "discovery", dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const eventDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const marketCloseTime = new Date(eventDeadline.getTime() - 60 * 60 * 1000);
    const { results: discoveryResults } = runDiscoveryBackedPipelineFromLeads(
      leads,
      { eventDeadline, marketCloseTime }
    );

    // Diagnostic: log first 2-3 conversion outcomes and lead shape to find drop 10→0 root cause
    const diagnosticSample = Math.min(3, discoveryResults.length);
    if (diagnosticSample > 0 && process.env.PIPELINE_DEBUG === "true") {
      for (let i = 0; i < diagnosticSample; i++) {
        const r = discoveryResults[i]!;
        const lead = leads[i];
        const leadShape = lead
          ? {
              readiness: lead.readiness,
              confidence: lead.confidence,
              memberItemIdsLength: lead.evidenceSet?.memberItemIds?.length ?? 0,
              memberSignalIdsLength: lead.evidenceSet?.memberSignalIds?.length ?? 0,
              hypothesisSummaryLength: lead.hypothesisSummary?.length ?? 0,
            }
          : null;
        console.log("[Discovery-backed] conversion diagnostic", i + 1, {
          conversionOutcome: r.conversionOutcome,
          conversionReasonCode: r.conversionReasonCode,
          leadShape,
        });
      }
    }

    const conversionCount = discoveryResults.filter(
      (r) => r.conversionOutcome === "converted"
    ).length;
    result.conversionCount = conversionCount;
    const observationIds = discoveryResults
      .map((r) => r.observationId)
      .filter((id): id is string => id != null);
    result.observationIds = observationIds;

    const candidates = discoveryResults
      .filter((r) => r.pipelineResult != null)
      .map((r) => {
        const pr = r.pipelineResult!;
        return pipelineArtifactsToAppCandidate({
          pipeline: pr.pipeline,
          titleSet: pr.titleSet,
          resolutionSummary: pr.resolutionSummary,
          observationId: r.observationId ?? undefined,
        });
      });

    const aiTitleConfig = getAITitleEngineConfig();
    await ensureTitlesForMarket(candidates, {
      maxCalls: aiTitleConfig.enabled ? aiTitleConfig.maxCallsPerRun : 0,
    });

    result.publishableFromDiscovery = candidates.length;
    result.candidatesCount = candidates.length;
    onStageComplete(runId, "candidate", {
      candidatesCount: candidates.length,
      conversionCount,
      observationIds,
    });

    if (candidates.length === 0) {
      if (debug) console.log("[Discovery-backed] No publishable candidates from leads");
      await persistDiscoveryPipelineRun(prisma, runId, result, { dryRun, eventIds: [], startedAt });
      onPipelineComplete(runId, result, { source: "discovery", dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const validationResult = validateCandidates(candidates);
    const validCandidates = validationResult.valid;
    result.rulebookValidCount = validCandidates.length;
    result.rulebookRejectedCount = validationResult.rejected.length;
    for (const [k, v] of Object.entries(validationResult.rejectionReasons)) {
      result.reasonsCount[k] = (result.reasonsCount[k] ?? 0) + v;
    }
    onStageComplete(runId, "validator", {
      validCount: validCandidates.length,
      rejectedCount: validationResult.rejected.length,
    });

    if (validCandidates.length === 0) {
      if (debug) console.log("[Discovery-backed] All candidates rejected by rulebook");
      await persistDiscoveryPipelineRun(prisma, runId, result, { dryRun, eventIds: [], startedAt });
      onPipelineComplete(runId, result, { source: "discovery", dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const storylineStatsMap = new Map<string, { momentum: number; novelty: number }>();
    const discoveryStats = { momentum: DEFAULT_MOMENTUM, novelty: DEFAULT_NOVELTY };
    storylineStatsMap.set(DISCOVERY_SOURCE_STORYLINE_ID, discoveryStats);
    for (const c of validCandidates) {
      if (
        c.sourceStorylineId &&
        (c.sourceStorylineId === DISCOVERY_SOURCE_STORYLINE_ID || c.sourceStorylineId.startsWith(`${DISCOVERY_SOURCE_STORYLINE_ID}:`)) &&
        !storylineStatsMap.has(c.sourceStorylineId)
      ) {
        storylineStatsMap.set(c.sourceStorylineId, discoveryStats);
      }
    }
    const scored = scoreCandidates(validCandidates, storylineStatsMap);

    const { deduped, reasonsCount: dedupReasons } = await dedupCandidates(prisma, scored);
    result.dedupedCandidatesCount = deduped.length;
    Object.assign(result.reasonsCount, dedupReasons);

    if (deduped.length === 0) {
      if (debug) console.log("[Discovery-backed] All candidates deduped");
      await persistDiscoveryPipelineRun(prisma, runId, result, { dryRun, eventIds: [], startedAt });
      onPipelineComplete(runId, result, { source: "discovery", dryRun, eventIds: [], durationMs: Date.now() - startedAt });
      return result;
    }

    const selectionInfo = await selectCandidatesWithInfo(prisma, deduped, now, {
      maxNewPerRun: maxTotal,
    });
    const selected = selectionInfo.selected;
    result.selectedCount = selected.length;
    result.openEventsCount = selectionInfo.openEventsCount;
    result.targetOpenEvents = selectionInfo.targetOpenEvents;
    result.need = selectionInfo.need;
    result.zeroSelectedReason = selectionInfo.zeroSelectedReason;
    const avgQualityScoreForRun = computeAvgQualityScoreFromSelected(selected);
    onStageComplete(runId, "scoring", {
      scoredCount: deduped.length,
      avgOverallScore: avgQualityScoreForRun,
    });

    if (selected.length === 0) {
      if (debug) console.log("[Discovery-backed] No candidates selected");
      await persistDiscoveryPipelineRun(prisma, runId, result, { dryRun, eventIds: [], startedAt });
      onPipelineComplete(runId, result, { source: "discovery", dryRun, eventIds: [], durationMs: Date.now() - startedAt });
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
      console.log("[Discovery-backed] DRY RUN: would publish", selected.length, "events");
    }
    onStageComplete(runId, "publish", {
      selectedCount: selected.length,
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
      eventIds,
    });

    await persistDiscoveryPipelineRun(prisma, runId, result, { dryRun, eventIds, avgQualityScore: avgQualityScoreForRun, startedAt });
    onPipelineComplete(runId, result, { source: "discovery", dryRun, eventIds, avgQualityScore: avgQualityScoreForRun, durationMs: Date.now() - startedAt });
    if (debug) console.log("[Discovery-backed] Summary:", result);
    result.eventIds = eventIds;
    return result;
  } catch (error) {
    console.error("[Discovery-backed] Error:", error);
    throw error;
  }
}
