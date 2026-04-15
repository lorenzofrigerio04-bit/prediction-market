import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";
import { priceYesMicros, pricesByOutcomeMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { getEventMarketSharesByOutcome } from "@/lib/amm/multi-outcome-engine";
import { parseOutcomesJson, MULTI_OPTION_MARKET_TYPES, isMarketTypeId } from "@/lib/market-types";
import { buildSportPageCategories } from "@/lib/sport-page-categories";

export const dynamic = "force-dynamic";

/** GET /api/events/sport — solo eventi con sourceType=SPORT (generati da pipeline sport), raggruppati per categoria. */
export async function GET() {
  try {
    const now = new Date();

    const whereBase = {
      sourceType: "SPORT",
      hidden: false,
      status: "OPEN",
      resolved: false,
      closesAt: { gt: now },
    };

    const dbCategories = await prisma.event.findMany({
      where: whereBase,
      select: { category: true },
      distinct: ["category"],
    });
    const categories = buildSportPageCategories(
      dbCategories.map((entry) => entry.category)
    );

    const eventsByCategory = await Promise.all(
      categories.map(async (category) => {
        const events = await prisma.event.findMany({
          where: { ...whereBase, category },
          orderBy: [{ closesAt: "asc" }, { totalCredits: "desc" }],
          include: {
            createdBy: {
              select: { id: true, name: true, image: true },
            },
            _count: {
              select: { Prediction: true, Trade: true, comments: true },
            },
            ammState: {
              select: { qYesMicros: true, qNoMicros: true, bMicros: true },
            },
          },
        });
        return { category, events };
      })
    );

    const eventIds = eventsByCategory.flatMap(({ events }) => events.map((e) => e.id));
    const fomoStats = await getEventsWithStats(prisma, eventIds, now);

    const predictionsCount = (c: { Prediction: number; Trade: number }) =>
      (c.Prediction ?? 0) + (c.Trade ?? 0);

    type EventMeta = { sport_league?: string; fie_version?: string } | null;
    const creationMeta = (event: { creationMetadata?: unknown }): EventMeta =>
      (event.creationMetadata as EventMeta) ?? null;

    type OutcomeProbability = { key: string; label: string; probabilityPct: number };

    const result: Record<string, Array<Record<string, unknown>>> = {};

    for (const { category, events } of eventsByCategory) {
      result[category] = await Promise.all(
        events.map(async (event) => {
          const stats = fomoStats.get(event.id);
          const { _count, ammState, ...rest } = event;
          const predCount = predictionsCount(_count as { Prediction: number; Trade: number });
          const meta = creationMeta(event);

          const marketType = event.marketType ?? "BINARY";
          const isMultiOutcomeMarket =
            isMarketTypeId(marketType) && MULTI_OPTION_MARKET_TYPES.includes(marketType);
          const outcomeOptions = parseOutcomesJson(event.outcomes) ?? [];

          let probability = 50;
          let outcomeProbabilities: OutcomeProbability[] | null = null;

          if (ammState) {
            const yesMicros = priceYesMicros(
              ammState.qYesMicros,
              ammState.qNoMicros,
              ammState.bMicros
            );
            probability = Number((yesMicros * 100n) / SCALE);
          }

          if (isMultiOutcomeMarket && outcomeOptions.length > 0) {
            try {
              const outcomeKeys = outcomeOptions.map((o) => o.key);
              const qByOutcome = await getEventMarketSharesByOutcome(prisma, event.id, outcomeKeys);
              const bMicros = BigInt(Math.max(1, Math.round((event.b ?? 1) * 1_000_000)));
              const prices = pricesByOutcomeMicros(outcomeKeys, qByOutcome, bMicros);
              outcomeProbabilities = outcomeOptions.map((opt) => ({
                key: opt.key,
                label: opt.label,
                probabilityPct: Number((prices[opt.key] * 100n) / SCALE),
              }));
              // Use the first outcome's probability as the main probability
              if (outcomeProbabilities.length > 0) {
                probability = outcomeProbabilities[0].probabilityPct;
              }
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
            sportLeague: meta?.sport_league ?? null,
            isFie: meta?.fie_version != null,
            _count: { predictions: predCount, comments: _count.comments },
            fomo: stats ?? {
              countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
              participantsCount: predCount,
              votesVelocity: 0,
              pointsMultiplier: 1.0,
              isClosingSoon: false,
            },
          };
        })
      );
    }

    return NextResponse.json({ categories, eventsByCategory: result });
  } catch (error) {
    console.error("Error fetching sport events:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento degli eventi sport." },
      { status: 500 }
    );
  }
}
