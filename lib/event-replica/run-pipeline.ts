import type { PrismaClient } from "@prisma/client";
import { fetchKalshiMarkets, fetchPolymarketMarkets } from "@/lib/event-sources";
import { getReplicaPipelineConfig } from "./config";
import { dedupByCanonicalTitle } from "./utils";
import { translateMarketSemantically } from "./semantic-translator";
import { buildReplicaCandidate } from "./candidate-adapter";
import { publishReplicaCandidates } from "./publisher";
import type {
  ReplicaRunParams,
  ReplicaRunResult,
  ReplicaSourcePlatform,
  SourceMarket,
} from "./types";

function createRunId(): string {
  return `replica-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function persistReplicaRun(
  prisma: PrismaClient,
  runId: string,
  startedAt: Date,
  result: ReplicaRunResult,
  dryRun: boolean
): Promise<void> {
  try {
    await prisma.pipelineRun.create({
      data: {
        runId,
        startedAt,
        completedAt: new Date(),
        dryRun,
        source: "replica",
        eligibleCount: result.sourceFetchedCount,
        candidatesCount: result.candidatesCount,
        rulebookValidCount: result.rulebookValidCount,
        rulebookRejectedCount: result.rulebookRejectedCount,
        dedupedCount: result.dedupedCandidatesCount,
        selectedCount: result.selectedCount,
        createdCount: result.createdCount,
        skippedCount: result.skippedCount,
        reasonsCount: result.reasonsCount,
        eventIds: result.eventIds,
        avgQualityScore: null,
      },
    });
  } catch (error) {
    console.warn("[Replica Pipeline] Unable to persist PipelineRun:", error);
  }
}

async function fetchReplicaSources(
  cfg: ReturnType<typeof getReplicaPipelineConfig>,
  sourcePlatforms: ReplicaSourcePlatform[]
): Promise<SourceMarket[]> {
  const uniqueSources = Array.from(new Set(sourcePlatforms));
  const rows = await Promise.all(
    uniqueSources.map((source) =>
      source === "polymarket"
        ? fetchPolymarketMarkets(cfg)
        : source === "kalshi"
          ? fetchKalshiMarkets(cfg)
          : Promise.resolve([])
    )
  );
  return rows.flat();
}

function selectTopByCategory(markets: SourceMarket[], topPerCategory: number): SourceMarket[] {
  const byCategory = new Map<string, SourceMarket[]>();
  for (const market of markets) {
    const key = market.category?.trim() || "Altro";
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)?.push(market);
  }

  const selected: SourceMarket[] = [];
  for (const rows of byCategory.values()) {
    const ranked = [...rows].sort((a, b) => {
      const bRank = b.provenance.rankValue ?? 0;
      const aRank = a.provenance.rankValue ?? 0;
      if (bRank !== aRank) return bRank - aRank;
      return b.closeTime.getTime() - a.closeTime.getTime();
    });
    selected.push(...ranked.slice(0, topPerCategory));
  }
  return selected;
}

export async function runReplicaPipeline(params: ReplicaRunParams): Promise<ReplicaRunResult> {
  const { prisma, now = new Date(), dryRun = false } = params;
  const cfg = getReplicaPipelineConfig();
  const maxTotal = params.maxTotal ?? cfg.maxTotalDefault;
  const sourcePlatforms =
    params.sourcePlatforms && params.sourcePlatforms.length > 0
      ? params.sourcePlatforms
      : (["kalshi"] satisfies ReplicaSourcePlatform[]);
  const runId = createRunId();
  const startedAt = new Date();

  const result: ReplicaRunResult = {
    sourceFetchedCount: 0,
    dedupedSourceCount: 0,
    italyFilteredCount: 0,
    translatedCount: 0,
    candidatesCount: 0,
    rulebookValidCount: 0,
    rulebookRejectedCount: 0,
    dedupedCandidatesCount: 0,
    selectedCount: 0,
    createdCount: 0,
    skippedCount: 0,
    reasonsCount: {},
    eventIds: [],
  };

  const sourceMarkets = await fetchReplicaSources(cfg, sourcePlatforms);
  result.sourceFetchedCount = sourceMarkets.length;
  if (sourceMarkets.length === 0) {
    await persistReplicaRun(prisma, runId, startedAt, result, dryRun);
    return result;
  }

  const deduped = dedupByCanonicalTitle(sourceMarkets);
  result.dedupedSourceCount = deduped.length;

  const filtered = selectTopByCategory(deduped, cfg.topPerCategory).map((market) => ({
    market,
    rankValue: market.provenance.rankValue ?? 0,
  }));
  result.italyFilteredCount = filtered.length;

  const candidates = [];
  for (const row of filtered) {
    if (row.market.closeTime <= now) {
      result.reasonsCount.closed_market = (result.reasonsCount.closed_market ?? 0) + 1;
      continue;
    }
    const translated = await translateMarketSemantically(row.market);
    if (cfg.requireAiTranslation && !translated.usedAI) {
      result.reasonsCount.translation_ai_unavailable = (result.reasonsCount.translation_ai_unavailable ?? 0) + 1;
      continue;
    }
    if (translated.confidence < 0.6) {
      result.reasonsCount.translation_low_confidence = (result.reasonsCount.translation_low_confidence ?? 0) + 1;
      continue;
    }
    const candidate = buildReplicaCandidate({
      market: row.market,
      translated,
      rank: {
        metric: "volume",
        value: row.rankValue,
      },
    });
    candidates.push(candidate);
  }

  result.translatedCount = candidates.length;
  result.candidatesCount = candidates.length;

  const publish = await publishReplicaCandidates({
    prisma,
    now,
    candidates,
    maxTotal: Math.max(maxTotal, candidates.length),
    dryRun,
  });

  result.rulebookValidCount = publish.rulebookValidCount;
  result.rulebookRejectedCount = publish.rulebookRejectedCount;
  result.dedupedCandidatesCount = publish.dedupedCandidatesCount;
  result.selectedCount = publish.selectedCount;
  result.createdCount = publish.createdCount;
  result.skippedCount = publish.skippedCount;
  result.reasonsCount = {
    ...result.reasonsCount,
    ...publish.reasonsCount,
  };
  result.eventIds = publish.eventIds;

  await persistReplicaRun(prisma, runId, startedAt, result, dryRun);
  return result;
}
