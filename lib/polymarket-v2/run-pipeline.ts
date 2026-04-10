import { dedupCandidates, publishSelectedV2 } from "@/lib/event-gen-v2/publisher";
import type { ScoredCandidate } from "@/lib/event-publishing/types";
import type { ReplicaCandidate } from "@/lib/event-replica/types";
import type { PrismaClient } from "@prisma/client";
import { getPolymarketV2Config } from "./config";
import { runFidelityGate } from "./fidelity-gate";
import { groupBinarySiblingsIntoMultiOutcome } from "./grouping";
import { ingestPolymarketMarkets } from "./ingest";
import { localizePolymarketMarket } from "./localization";
import { mapToPolymarketV2Candidate } from "./mapping";
import { scoreMarketSoft } from "./scoring";
import { syncExistingPolymarketV2Events } from "./sync";
import { runValidityGate } from "./validity-gate";
import type { PolymarketV2RunParams, PolymarketV2RunResult } from "./types";

function createRunId(): string {
  return `polymarket-v2-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function persistRun(
  prisma: PrismaClient,
  runId: string,
  startedAt: Date,
  result: PolymarketV2RunResult,
  dryRun: boolean
): Promise<void> {
  try {
    await prisma.pipelineRun.create({
      data: {
        runId,
        startedAt,
        completedAt: new Date(),
        dryRun,
        source: "polymarket-v2",
        eligibleCount: result.sourceFetchedCount,
        candidatesCount: result.candidatesCount,
        rulebookValidCount: result.fidelityPassedCount,
        rulebookRejectedCount: result.candidatesCount - result.fidelityPassedCount,
        dedupedCount: result.selectedCount,
        selectedCount: result.selectedCount,
        createdCount: result.createdCount,
        skippedCount: result.skippedCount + result.updatedCount,
        reasonsCount: result.reasonsCount,
        eventIds: result.eventIds,
        avgQualityScore: null,
      },
    });
  } catch (error) {
    console.warn("[Polymarket V2] unable to persist run:", error);
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const safeConcurrency = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: safeConcurrency }, async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function runPolymarketV2Pipeline(
  params: PolymarketV2RunParams
): Promise<PolymarketV2RunResult> {
  const cfg = getPolymarketV2Config();
  const { prisma, now = new Date(), dryRun = false } = params;
  const maxTotal = params.maxTotal ?? cfg.maxTotalDefault;
  const runId = createRunId();
  const startedAt = new Date();

  const result: PolymarketV2RunResult = {
    sourceFetchedCount: 0,
    validityPassedCount: 0,
    translatedCount: 0,
    fidelityPassedCount: 0,
    candidatesCount: 0,
    binaryCount: 0,
    multiOutcomeCount: 0,
    selectedCount: 0,
    createdCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    duplicatesCount: 0,
    warningsCount: 0,
    errorCount: 0,
    reasonsCount: {},
    warningsSummary: {},
    eventIds: [],
  };

  const fetchedMarkets = await ingestPolymarketMarkets();
  result.sourceFetchedCount = fetchedMarkets.length;
  if (fetchedMarkets.length === 0) {
    await persistRun(prisma, runId, startedAt, result, dryRun);
    return result;
  }
  const grouped = groupBinarySiblingsIntoMultiOutcome({
    markets: fetchedMarkets,
    minSiblings: cfg.groupingMinSiblings,
    maxOutcomes: cfg.groupingMaxOutcomes,
  });
  if (grouped.groupedClusterCount > 0) {
    result.reasonsCount.grouped_clusters = grouped.groupedClusterCount;
    result.reasonsCount.grouped_source_markets = grouped.groupedSourceMarketsCount;
  }
  const markets = grouped.groupedMarkets;

  const validMarkets: Array<{
    market: Awaited<ReturnType<typeof ingestPolymarketMarkets>>[number];
    softScore: ReturnType<typeof scoreMarketSoft>;
    ranking: number;
  }> = [];
  for (const market of markets) {
    const validity = runValidityGate(market, now);
    if (!validity.ok) {
      for (const reason of validity.reasons) {
        result.reasonsCount[reason] = (result.reasonsCount[reason] ?? 0) + 1;
      }
      continue;
    }
    result.validityPassedCount += 1;

    const softScore = scoreMarketSoft(market);
    const rankValue = market.provenance.rankValue ?? 0;
    validMarkets.push({
      market,
      softScore,
      ranking: softScore.score * 0.85 + Math.min(0.15, rankValue / 500_000),
    });
  }

  const processingCap = Math.max(maxTotal, maxTotal * cfg.processingHeadroomMultiplier);
  const rankedMarkets = validMarkets
    .sort((a, b) => b.ranking - a.ranking)
    .slice(0, processingCap);
  const preCutoff = Math.max(0, validMarkets.length - rankedMarkets.length);
  if (preCutoff > 0) {
    result.reasonsCount.pre_cutoff = preCutoff;
  }

  const localizedOutcomes = await mapWithConcurrency(
    rankedMarkets,
    cfg.localizationConcurrency,
    async ({ market, softScore }) => {
      const translated = await localizePolymarketMarket(market);
      if (cfg.requireAiTranslation && !translated.usedAI) {
        return { kind: "discard" as const, reason: "translation_ai_unavailable" };
      }

      const fidelity = runFidelityGate(market, translated, cfg.fidelityMinScore);
      if (!fidelity.ok) {
        return { kind: "discard" as const, reason: "fidelity_gate_reject" };
      }

      const candidate = mapToPolymarketV2Candidate({
        market,
        translated,
        softScore,
      });
      return {
        kind: "candidate" as const,
        candidate,
        externalId: market.externalId,
        ranking: softScore.score * 0.5 + fidelity.score * 0.5,
        warnings: fidelity.warnings,
      };
    }
  );

  const candidateBundles: Array<{ candidate: ReplicaCandidate; externalId: string; ranking: number }> = [];
  for (const row of localizedOutcomes) {
    if (row.kind === "discard") {
      result.reasonsCount[row.reason] = (result.reasonsCount[row.reason] ?? 0) + 1;
      continue;
    }

    result.translatedCount += 1;
    result.fidelityPassedCount += 1;
    for (const warning of row.warnings) {
      result.warningsSummary[warning] = (result.warningsSummary[warning] ?? 0) + 1;
      result.warningsCount += 1;
    }

    const marketType = String(row.candidate.marketType ?? "BINARY");
    if (marketType === "BINARY" || marketType === "THRESHOLD") {
      result.binaryCount += 1;
    } else {
      result.multiOutcomeCount += 1;
    }

    candidateBundles.push({
      candidate: row.candidate,
      externalId: row.externalId,
      ranking: row.ranking,
    });
  }

  result.candidatesCount = candidateBundles.length;
  if (candidateBundles.length === 0) {
    await persistRun(prisma, runId, startedAt, result, dryRun);
    return result;
  }

  const sortedBundles = candidateBundles.sort((a, b) => b.ranking - a.ranking);
  const candidates = sortedBundles.map((b) => b.candidate);
  const syncResult = await syncExistingPolymarketV2Events(prisma, candidates, now, dryRun);
  result.updatedCount = syncResult.updatedCount;

  const updatedExternalSet = new Set(syncResult.updatedExternalIds);
  const toCreate = sortedBundles
    .filter((b) => !updatedExternalSet.has(b.externalId))
    .map((b) => b.candidate);

  // Polymarket 2.0 is intentionally permissive: after structural/fidelity gates,
  // do not apply legacy rulebook rejection (e.g. far future, non-binary wording).
  const scored: ScoredCandidate[] = toCreate.map((candidate) => ({
    ...candidate,
    score: 100,
    overall_score: 1,
    scoreBreakdown: {
      momentum: candidate.momentum ?? 80,
      novelty: candidate.novelty ?? 50,
      authority: 100,
      clarity: 100,
    },
    qualityScores: {
      trend_score: 1,
      clarity_score: 1,
      psychological_score: 1,
      resolution_score: 1,
      novelty_score: 1,
      image_score: 1,
      overall_score: 1,
    },
  }));
  const deduped = await dedupCandidates(prisma, scored);
  result.duplicatesCount = (deduped.reasonsCount.DUPLICATE_IN_DB ?? 0) + (deduped.reasonsCount.DUPLICATE_IN_RUN ?? 0);
  result.reasonsCount = { ...result.reasonsCount, ...deduped.reasonsCount };
  const selected = deduped.deduped;
  result.selectedCount = selected.length;

  if (!dryRun && selected.length > 0) {
    const publish = await publishSelectedV2(prisma, selected, now, {
      sourceType: "NEWS",
    });
    result.createdCount = publish.createdCount;
    result.skippedCount = publish.skippedCount;
    result.eventIds = publish.eventIds ?? [];
    result.reasonsCount = { ...result.reasonsCount, ...publish.reasonsCount };
  }

  await persistRun(prisma, runId, startedAt, result, dryRun);
  return result;
}
