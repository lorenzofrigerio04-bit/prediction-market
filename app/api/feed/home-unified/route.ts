import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, pricesByOutcomeMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";
import { rerankFeed } from "@/lib/personalization/reranking";
import { scoreMarketForUser, type UserProfileView } from "@/lib/personalization/scoring";
import { computeProfileFromPredictions } from "@/lib/personalization/user-profile";
import { categoryToSlug } from "@/lib/category-slug";
import {
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";
import { getEventMarketSharesByOutcome } from "@/lib/amm/multi-outcome-engine";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 120;
const TOP_FEATURED_LIMIT = 5;
const TOP_FEATURED_WINDOW_MS = 24 * 60 * 60 * 1000;
const MICROS_PER_CREDIT = 1_000_000n;

function normalizeCategorySlug(raw: string | null): string | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function matchesRequestedCategory(requestedSlug: string, categoryName: string): boolean {
  const categorySlug = categoryToSlug(categoryName);
  if (categorySlug === requestedSlug) return true;

  if (requestedSlug === "tecnologia-e-scienza") {
    return (
      categorySlug === "tecnologia" ||
      categorySlug === "scienza" ||
      categorySlug === "tech-science"
    );
  }

  if (requestedSlug === "sport") {
    return [
      "sport",
      "calcio",
      "tennis",
      "pallacanestro",
      "pallavolo",
      "formula-1",
      "motogp",
    ].includes(categorySlug);
  }

  return false;
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

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function mixConsecutiveCategories<T extends { category: string }>(items: T[]): T[] {
  if (items.length <= 2) return items;
  const pool = [...items];
  const mixed: T[] = [];

  while (pool.length > 0) {
    const lastCategory = mixed.length > 0 ? mixed[mixed.length - 1].category : null;
    const nextIdx = pool.findIndex((item) => item.category !== lastCategory);
    const pickIdx = nextIdx >= 0 ? nextIdx : 0;
    mixed.push(pool[pickIdx]);
    pool.splice(pickIdx, 1);
  }

  return mixed;
}

/**
 * GET /api/feed/home-unified
 * Feed homepage (utente loggato): solo eventi notizie (sourceType null o NEWS).
 * Gli eventi sport (sourceType=SPORT) non compaiono qui, solo in /sport.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(
        searchParams.get("limit") ||
          searchParams.get("limitPerCategory") ||
          String(DEFAULT_LIMIT),
        10
      ) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const requestedCategorySlug = normalizeCategorySlug(searchParams.get("categorySlug"));

    const now = new Date();

    const eventsRaw = await prisma.event.findMany({
      where: {
        ...HOME_FEED_SOURCE_TYPE,
        resolved: false,
        closesAt: { gt: now },
      },
      orderBy: [{ closesAt: "asc" }, { createdAt: "desc" }],
      take: Math.max(limit * 3, 140),
      include: {
        _count: { select: { Prediction: true, Trade: true } },
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
        posts: {
          where: { type: "AI_IMAGE", aiImageUrl: { not: null } },
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { aiImageUrl: true },
        },
      },
    });

    const eventIds = eventsRaw.map((event) => event.id);
    const [buyTradesByEvent, predictionsByEvent] = eventIds.length
      ? await Promise.all([
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
        ])
      : [[], []];

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

    const predictionsCount = (c: { Prediction: number; Trade?: number }) =>
      (c.Prediction ?? 0) + (c.Trade ?? 0);

    const processed = await Promise.all(
      eventsRaw.map(async (event) => {
        const { _count, ammState } = event;
        const predCount = predictionsCount(_count as { Prediction: number; Trade: number });
        let probability = 50;
        let outcomeProbabilities:
          | Array<{ key: string; label: string; probabilityPct: number }>
          | null = null;
        const marketType = event.marketType ?? "BINARY";
        const isMultiOutcomeMarket =
          isMarketTypeId(marketType) &&
          MULTI_OPTION_MARKET_TYPES.includes(marketType);
        const outcomeOptions = parseOutcomesJson(event.outcomes) ?? [];
        if (ammState) {
          const yesMicros = priceYesMicros(
            ammState.qYesMicros,
            ammState.qNoMicros,
            ammState.bMicros
          );
          probability = Number((yesMicros * 100n) / SCALE);
        } else if (isMultiOutcomeMarket && outcomeOptions.length > 0) {
          try {
            const outcomeKeys = outcomeOptions.map((o) => o.key);
            const qByOutcome = await getEventMarketSharesByOutcome(
              prisma,
              event.id,
              outcomeKeys
            );
            const bMicros = BigInt(Math.max(1, Math.round((event.b ?? 1) * 1_000_000)));
            const prices = pricesByOutcomeMicros(outcomeKeys, qByOutcome, bMicros);
            outcomeProbabilities = outcomeOptions.map((opt) => ({
              key: opt.key,
              label: opt.label,
              probabilityPct: Number((prices[opt.key] * 100n) / SCALE),
            }));
          } catch {
            outcomeProbabilities = outcomeOptions.map((opt) => ({
              key: opt.key,
              label: opt.label,
              probabilityPct: Math.round(100 / Math.max(1, outcomeOptions.length)),
            }));
          }
        }
        return {
          id: event.id,
          title: event.title,
          category: event.category?.trim() || "Altro",
          closesAt: event.closesAt,
          createdAt: event.createdAt,
          totalCredits:
            buyTradeCreditsMap.get(event.id) ??
            predictionCreditsMap.get(event.id) ??
            event.totalCredits ??
            0,
          b: event.b ?? 1,
          predictionsCount: predCount,
          yesPct: Math.round(probability ?? 50),
          aiImageUrl:
            event.imageUrl ??
            (event as { posts?: { aiImageUrl: string | null }[] }).posts?.[0]?.aiImageUrl ??
            undefined,
          marketType: event.marketType ?? undefined,
          outcomes: parseOutcomesJson(event.outcomes) ?? undefined,
          outcomeProbabilities: outcomeProbabilities ?? undefined,
          replicaRankValue: getReplicaRankValue(
            (event as { creationMetadata?: unknown }).creationMetadata
          ),
        };
      })
    );

    const filteredByCategory = requestedCategorySlug
      ? processed.filter((event) =>
          matchesRequestedCategory(requestedCategorySlug, event.category)
        )
      : processed;

    if (filteredByCategory.length === 0) {
      return NextResponse.json({ events: [] });
    }

    let profile: UserProfileView | null = null;
    if (userId) {
      const extracted = await computeProfileFromPredictions(prisma, userId);
      if (extracted) {
        profile = {
          preferredCategories: extracted.preferredCategories,
          riskTolerance: extracted.riskTolerance,
          preferredHorizon: extracted.preferredHorizon,
        };
      }
    }

    const maxVolume = Math.max(...filteredByCategory.map((e) => e.predictionsCount), 1);
    const oldestCreatedAt = Math.min(
      ...filteredByCategory.map((e) => e.createdAt.getTime())
    );
    const maxAgeMs = Math.max(Date.now() - oldestCreatedAt, 1);

    const ranked = filteredByCategory
      .map((event) => {
        const popularityScore = clamp01(
          Math.log1p(event.predictionsCount) / Math.log1p(180)
        );
        const replicaScore = clamp01(Math.log10(event.replicaRankValue + 1));
        const daysToClose = (event.closesAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore = clamp01(1 - Math.min(Math.max(daysToClose, 0), 45) / 45);
        const personalScore = profile
          ? scoreMarketForUser(
              {
                id: event.id,
                category: event.category,
                closesAt: event.closesAt,
                createdAt: event.createdAt,
                totalCredits: event.totalCredits,
                b: event.b,
                volume_6h: event.predictionsCount,
                impressions: Math.max(1, event.predictionsCount * 4),
              },
              profile,
              { maxAgeMs, maxVolume }
            )
          : 0;
        const globalBaseScore =
          0.5 * popularityScore + 0.3 * replicaScore + 0.2 * urgencyScore;
        const score = profile
          ? 0.6 * personalScore + 0.4 * globalBaseScore
          : globalBaseScore;
        return { ...event, score };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.closesAt.getTime() - b.closesAt.getTime();
      });

    const reranked = rerankFeed(
      ranked.map((event) => ({
        ...event,
        eventId: event.id,
      }))
    );
    const mixed = mixConsecutiveCategories(reranked);

    const nowMs = now.getTime();
    const cutoff24h = nowMs - TOP_FEATURED_WINDOW_MS;
    const featuredPool = ranked.filter((event) => event.createdAt.getTime() >= cutoff24h);
    const featuredSource = [
      ...featuredPool,
      ...ranked.filter((event) => event.createdAt.getTime() < cutoff24h),
    ];
    const featuredEvents = featuredSource.slice(0, TOP_FEATURED_LIMIT).map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      closesAt: event.closesAt,
      yesPct: event.yesPct,
      predictionsCount: event.predictionsCount,
      totalCredits: event.totalCredits,
      aiImageUrl: event.aiImageUrl,
      marketType: event.marketType,
      outcomes: event.outcomes,
      outcomeProbabilities: event.outcomeProbabilities,
    }));

    const events = mixed.slice(0, limit).map((event) => ({
      id: event.id,
      title: event.title,
      category: event.category,
      closesAt: event.closesAt,
      yesPct: event.yesPct,
      predictionsCount: event.predictionsCount,
      totalCredits: event.totalCredits,
      aiImageUrl: event.aiImageUrl,
      marketType: event.marketType,
      outcomes: event.outcomes,
      outcomeProbabilities: event.outcomeProbabilities,
    }));

    return NextResponse.json({ events, featuredEvents });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Feed home-unified error:", message);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
