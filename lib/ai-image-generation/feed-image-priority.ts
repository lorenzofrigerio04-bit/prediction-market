/**
 * Priorità generazione copertine: allineata allo score "trending" di
 * /api/feed/home-unified (senza profilo utente), così le prime immagini
 * servono gli eventi che l’utente vede prima in home.
 */

import type { PrismaClient } from "@prisma/client";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";

const MICROS_PER_CREDIT = 1_000_000n;

/** Allinea a home-unified: trendingScore = 0.75*pop + 0.15*replica + 0.1*urgency */
const SCAN_CAP = 500;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function normalizedLog(value: number, maxValue: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const safeMax = Math.max(1, maxValue);
  return clamp01(Math.log1p(value) / Math.log1p(safeMax));
}

function getReplicaRankValue(input: unknown): number {
  if (!input || typeof input !== "object" || Array.isArray(input)) return 0;
  const record = input as Record<string, unknown>;
  const raw = record.replica_rank_value;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

type CandidateRow = {
  id: string;
  createdAt: Date;
  closesAt: Date;
  totalCredits: number | null;
  creationMetadata: unknown;
  _count: { Prediction: number; Trade: number };
};

/**
 * Eventi home-like senza copertina, ordinati come il trending del feed unificato.
 */
export async function getPendingImageEventIdsFeedPriority(
  prisma: PrismaClient,
  params: {
    staleBefore: Date;
    limit: number;
  }
): Promise<string[]> {
  const now = new Date();
  const candidates = await prisma.event.findMany({
    where: {
      hidden: false,
      resolved: false,
      closesAt: { gt: now },
      ...HOME_FEED_SOURCE_TYPE,
      AND: [
        { OR: [{ imageUrl: null }, { imageUrl: "" }] },
        {
          OR: [
            { imageGenerationStatus: { in: ["PENDING", "FAILED"] } },
            {
              imageGenerationStatus: "IN_PROGRESS",
              updatedAt: { lt: params.staleBefore },
            },
          ],
        },
      ],
    },
    take: SCAN_CAP,
    select: {
      id: true,
      closesAt: true,
      totalCredits: true,
      creationMetadata: true,
      _count: { select: { Prediction: true, Trade: true } },
    },
  });

  if (candidates.length === 0) return [];

  const eventIds = candidates.map((e) => e.id);
  const [buyTradesByEvent, predictionsByEvent] = await Promise.all([
    prisma.trade.groupBy({
      by: ["eventId"],
      where: { eventId: { in: eventIds }, side: "BUY" },
      _sum: { costMicros: true },
    }),
    prisma.prediction.groupBy({
      by: ["eventId"],
      where: { eventId: { in: eventIds } },
      _sum: { credits: true },
    }),
  ]);

  const buyTradeCreditsMap = new Map<string, number>();
  for (const row of buyTradesByEvent) {
    const raw = row._sum.costMicros ?? 0n;
    const absMicros = raw < 0n ? -raw : raw;
    const credits = Number(absMicros / MICROS_PER_CREDIT);
    if (Number.isFinite(credits) && credits >= 0) {
      buyTradeCreditsMap.set(row.eventId, credits);
    }
  }
  const predictionCreditsMap = new Map<string, number>();
  for (const row of predictionsByEvent) {
    const credits = row._sum.credits ?? 0;
    if (Number.isFinite(credits) && credits >= 0) {
      predictionCreditsMap.set(row.eventId, credits);
    }
  }

  const predictionsCount = (c: CandidateRow) =>
    (c._count.Prediction ?? 0) + (c._count.Trade ?? 0);

  const processed = candidates.map((event) => {
    const totalCredits =
      buyTradeCreditsMap.get(event.id) ??
      predictionCreditsMap.get(event.id) ??
      event.totalCredits ??
      0;
    return {
      id: event.id,
      predictionsCount: predictionsCount(event as CandidateRow),
      totalCredits,
      replicaRankValue: getReplicaRankValue(event.creationMetadata),
      closesAt: event.closesAt,
    };
  });

  const maxVolume = Math.max(...processed.map((e) => e.predictionsCount), 1);
  const maxCredits = Math.max(...processed.map((e) => e.totalCredits), 1);

  const scored = processed.map((event) => {
    const predictionsNorm = normalizedLog(event.predictionsCount, maxVolume);
    const creditsNorm = normalizedLog(event.totalCredits, maxCredits);
    const popularityScore = 0.65 * predictionsNorm + 0.35 * creditsNorm;
    const replicaScore = clamp01(Math.log10(event.replicaRankValue + 1));
    const daysToClose = (event.closesAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    const urgencyScore = clamp01(1 - Math.min(Math.max(daysToClose, 0), 45) / 45);
    void maxAgeMs; // recency usato nel for-you loggato, non nel trending
    const trendingScore =
      0.75 * popularityScore + 0.15 * replicaScore + 0.1 * urgencyScore;
    return {
      id: event.id,
      trendingScore,
      predictionsCount: event.predictionsCount,
      totalCredits: event.totalCredits,
    };
  });

  scored.sort((a, b) => {
    if (b.trendingScore !== a.trendingScore) return b.trendingScore - a.trendingScore;
    if (b.predictionsCount !== a.predictionsCount) return b.predictionsCount - a.predictionsCount;
    return b.totalCredits - a.totalCredits;
  });

  return scored.slice(0, params.limit).map((s) => s.id);
}
