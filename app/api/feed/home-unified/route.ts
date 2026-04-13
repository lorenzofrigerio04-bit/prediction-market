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
import { MARKET_CATEGORIES, type MarketCategoryId } from "@/lib/market-categories";

export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 120;
const TOP24H_LIMIT = 10;
const TOP24H_WINDOW_MS = 24 * 60 * 60 * 1000;
const RAIL_LIMIT = 16;
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

function normalizedLog(value: number, maxValue: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const safeMax = Math.max(1, maxValue);
  return clamp01(Math.log1p(value) / Math.log1p(safeMax));
}

const SPORTS_CATEGORY_SLUGS = [
  "sport",
  "calcio",
  "tennis",
  "pallacanestro",
  "pallavolo",
  "formula-1",
  "motogp",
];

function eventBelongsToCategoryId(eventCategory: string, categoryId: MarketCategoryId): boolean {
  if (categoryId === "trending") return true;
  const slug = categoryToSlug(eventCategory);
  if (categoryId === "elections") return slug === "elezioni" || slug === "elections";
  if (categoryId === "politics") return slug === "politica" || slug === "politics";
  if (categoryId === "sports") return SPORTS_CATEGORY_SLUGS.includes(slug);
  if (categoryId === "culture") return slug === "cultura" || slug === "culture";
  if (categoryId === "crypto") return slug === "cripto" || slug === "crypto";
  if (categoryId === "climate") return slug === "clima" || slug === "climate";
  if (categoryId === "economics") return slug === "economia" || slug === "economics";
  if (categoryId === "mentions") return slug === "menzioni" || slug === "mentions";
  if (categoryId === "companies") return slug === "aziende" || slug === "companies";
  if (categoryId === "finance") return slug === "finanza" || slug === "financials";
  if (categoryId === "tech-science") {
    return (
      slug === "tecnologia" ||
      slug === "scienza" ||
      slug === "tech-science" ||
      slug === "tecnologia-e-scienza"
    );
  }
  return false;
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

interface ApiHomeEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  createdAt?: string;
  yesPct: number;
  predictionsCount: number;
  totalCredits: number;
  aiImageUrl?: string;
  marketType?: string;
  outcomes?: Array<{ key: string; label: string }>;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }>;
}

type ScoredEvent = {
  id: string;
  title: string;
  category: string;
  closesAt: Date;
  categorySlug: string;
  createdAt: Date;
  yesPct: number;
  predictionsCount: number;
  totalCredits: number;
  aiImageUrl?: string;
  marketType?: string;
  outcomes?: Array<{ key: string; label: string }>;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }>;
  b: number;
  replicaRankValue: number;
  popularityScore: number;
  forYouScore: number;
  trendingScore: number;
};

function toApiEvent(event: ScoredEvent): ApiHomeEvent {
  return {
    id: event.id,
    title: event.title,
    category: event.category,
    closesAt: event.closesAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
    yesPct: event.yesPct,
    predictionsCount: event.predictionsCount,
    totalCredits: event.totalCredits,
    aiImageUrl: event.aiImageUrl,
    marketType: event.marketType,
    outcomes: event.outcomes,
    outcomeProbabilities: event.outcomeProbabilities,
  };
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
      return NextResponse.json({
        heroEvent: null,
        rows: {
          forYou: [],
          trending: [],
          top24h: [],
          followed: [],
          categories: [],
        },
        events: [],
        featuredEvents: [],
      });
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
    const maxCredits = Math.max(...filteredByCategory.map((e) => e.totalCredits), 1);
    const oldestCreatedAt = Math.min(
      ...filteredByCategory.map((e) => e.createdAt.getTime())
    );
    const maxAgeMs = Math.max(Date.now() - oldestCreatedAt, 1);

    const scored = filteredByCategory
      .map((event): ScoredEvent => {
        const predictionsNorm = normalizedLog(event.predictionsCount, maxVolume);
        const creditsNorm = normalizedLog(event.totalCredits, maxCredits);
        const popularityScore = 0.65 * predictionsNorm + 0.35 * creditsNorm;
        const replicaScore = clamp01(Math.log10(event.replicaRankValue + 1));
        const daysToClose = (event.closesAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const urgencyScore = clamp01(1 - Math.min(Math.max(daysToClose, 0), 45) / 45);
        const recencyScore = clamp01(1 - Math.min((Date.now() - event.createdAt.getTime()) / maxAgeMs, 1));
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
        const globalBaseScore = 0.55 * popularityScore + 0.25 * replicaScore + 0.2 * urgencyScore;
        const forYouScore = profile
          ? 0.62 * personalScore + 0.28 * popularityScore + 0.1 * recencyScore
          : 0.72 * popularityScore + 0.28 * recencyScore;
        const trendingScore = 0.75 * popularityScore + 0.15 * replicaScore + 0.1 * urgencyScore;
        return {
          ...event,
          categorySlug: categoryToSlug(event.category),
          popularityScore: globalBaseScore,
          forYouScore,
          trendingScore,
        };
      });

    const trendingSorted = [...scored].sort((a, b) => {
      if (b.trendingScore !== a.trendingScore) return b.trendingScore - a.trendingScore;
      if (b.predictionsCount !== a.predictionsCount) return b.predictionsCount - a.predictionsCount;
      return b.totalCredits - a.totalCredits;
    });
    const forYouSorted = [...scored].sort((a, b) => {
      if (b.forYouScore !== a.forYouScore) return b.forYouScore - a.forYouScore;
      return b.trendingScore - a.trendingScore;
    });

    const eventIdsForUserSignals = trendingSorted.map((event) => event.id);
    const [predictionRows, followedRows] = userId
      ? await Promise.all([
          prisma.prediction.findMany({
            where: { userId, eventId: { in: eventIdsForUserSignals } },
            select: { eventId: true },
            distinct: ["eventId"],
          }),
          prisma.eventFollower.findMany({
            where: { userId, eventId: { in: eventIdsForUserSignals } },
            select: { eventId: true },
          }),
        ])
      : [[], []];
    const predictedEventIds = new Set(predictionRows.map((row) => row.eventId));
    const followedEventIds = new Set(followedRows.map((row) => row.eventId));

    const heroEventScored =
      trendingSorted.find((event) => !predictedEventIds.has(event.id)) ?? trendingSorted[0] ?? null;
    const heroId = heroEventScored?.id ?? null;
    const withoutHero = heroId ? trendingSorted.filter((event) => event.id !== heroId) : trendingSorted;

    const forYouRail = rerankFeed(
      forYouSorted
        .filter((event) => event.id !== heroId)
        .map((event) => ({ ...event, eventId: event.id }))
    )
      .slice(0, RAIL_LIMIT)
      .map(toApiEvent);
    const trendingRail = mixConsecutiveCategories(withoutHero)
      .slice(0, RAIL_LIMIT)
      .map(toApiEvent);

    const nowMs = now.getTime();
    const cutoff24h = nowMs - TOP24H_WINDOW_MS;
    const top24hSource = [
      ...withoutHero.filter((event) => event.createdAt.getTime() >= cutoff24h),
      ...withoutHero.filter((event) => event.createdAt.getTime() < cutoff24h),
    ];
    const top24hRail = top24hSource.slice(0, TOP24H_LIMIT).map(toApiEvent);

    const followedRail = withoutHero
      .filter((event) => followedEventIds.has(event.id))
      .slice(0, RAIL_LIMIT)
      .map(toApiEvent);

    const categoryRails = MARKET_CATEGORIES
      .filter((category) => category.id !== "trending")
      .map((category) => ({
        id: category.id,
        label: category.label,
        href: category.href,
        events: withoutHero
          .filter((event) => eventBelongsToCategoryId(event.category, category.id))
          .slice(0, 12)
          .map(toApiEvent),
      }))
      .filter((row) => row.events.length > 0);

    const events = mixConsecutiveCategories(
      rerankFeed(withoutHero.map((event) => ({ ...event, eventId: event.id })))
    )
      .slice(0, limit)
      .map(toApiEvent);

    return NextResponse.json({
      heroEvent: heroEventScored ? toApiEvent(heroEventScored) : null,
      rows: {
        forYou: forYouRail,
        trending: trendingRail,
        top24h: top24hRail,
        followed: followedRail,
        categories: categoryRails,
      },
      events,
      featuredEvents: top24hRail,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Feed home-unified error:", message);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
