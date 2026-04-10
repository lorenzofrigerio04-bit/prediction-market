import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, pricesByOutcomeMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";
import {
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";
import { getEventMarketSharesByOutcome } from "@/lib/amm/multi-outcome-engine";

export const dynamic = "force-dynamic";

const EVENTS_PER_CATEGORY = 10;

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

/**
 * GET /api/feed/home-unified
 * Feed homepage (utente loggato): solo eventi notizie (sourceType null o NEWS).
 * Gli eventi sport (sourceType=SPORT) non compaiono qui, solo in /sport.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limitPerCategory") || String(EVENTS_PER_CATEGORY), 10) ||
        EVENTS_PER_CATEGORY,
      20
    );

    const now = new Date();

    const eventsRaw = await prisma.event.findMany({
      where: {
        ...HOME_FEED_SOURCE_TYPE,
        resolved: false,
        closesAt: { gt: now },
      },
      orderBy: [{ closesAt: "asc" }, { createdAt: "desc" }],
      take: 200,
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

    const predictionsCount = (c: { Prediction: number; Trade?: number }) =>
      (c.Prediction ?? 0) + (c.Trade ?? 0);

    const events = await Promise.all(eventsRaw.map(async (event) => {
      const { _count, ammState, ...rest } = event;
      const predCount = predictionsCount(
        _count as { Prediction: number; Trade: number }
      );
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
        ...rest,
        probability,
        outcomeProbabilities,
        _count: { predictions: predCount },
      };
    }));

    const byCategory = new Map<string, typeof events>();
    for (const event of events) {
      const category = event.category?.trim() || "Altro";
      if (!byCategory.has(category)) byCategory.set(category, []);
      byCategory.get(category)?.push(event);
    }

    const sections = [...byCategory.entries()]
      .map(([category, rows]) => {
        const ranked = [...rows].sort((a, b) => {
          const rankDiff =
            getReplicaRankValue((b as { creationMetadata?: unknown }).creationMetadata) -
            getReplicaRankValue((a as { creationMetadata?: unknown }).creationMetadata);
          if (rankDiff !== 0) return rankDiff;
          const countDiff = (b._count?.predictions ?? 0) - (a._count?.predictions ?? 0);
          if (countDiff !== 0) return countDiff;
          return new Date(a.closesAt).getTime() - new Date(b.closesAt).getTime();
        });

        return {
          category,
          events: ranked.slice(0, limit).map((e) => ({
            id: e.id,
            title: e.title,
            category: e.category,
            closesAt: e.closesAt,
            yesPct: Math.round(e.probability ?? 50),
            predictionsCount: e._count?.predictions,
            aiImageUrl:
              e.imageUrl ??
              (e as { posts?: { aiImageUrl: string | null }[] }).posts?.[0]?.aiImageUrl ??
              undefined,
            marketType: e.marketType ?? undefined,
            outcomes: parseOutcomesJson(e.outcomes) ?? undefined,
            outcomeProbabilities:
              (e as { outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null }).outcomeProbabilities ??
              undefined,
          })),
        };
      })
      .filter((section) => section.events.length > 0)
      .sort((a, b) => a.category.localeCompare(b.category, "it"));

    return NextResponse.json({ sections });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Feed home-unified error:", message);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
