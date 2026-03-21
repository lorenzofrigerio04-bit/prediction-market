import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { SPORT_PAGE_CATEGORIES } from "@/lib/sport-page-categories";

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

    const eventsByCategory = await Promise.all(
      SPORT_PAGE_CATEGORIES.map(async (category) => {
        const events = await prisma.event.findMany({
          where: { ...whereBase, category },
          orderBy: [{ closesAt: "asc" }, { totalCredits: "desc" }],
          take: 20,
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

    const result: Record<string, Array<Record<string, unknown>>> = {};

    const creationMeta = (event: { creationMetadata?: unknown }) =>
      (event.creationMetadata as { sport_league?: string } | null)?.sport_league ?? null;

    for (const { category, events } of eventsByCategory) {
      result[category] = events.map((event) => {
        const stats = fomoStats.get(event.id);
        const { _count, ammState, ...rest } = event;
        const predCount = predictionsCount(_count as { Prediction: number; Trade: number });
        let probability = 50;
        if (ammState) {
          const yesMicros = priceYesMicros(
            ammState.qYesMicros,
            ammState.qNoMicros,
            ammState.bMicros
          );
          probability = Number((yesMicros * 100n) / SCALE);
        }
        return {
          ...rest,
          probability,
          sportLeague: creationMeta(event),
          _count: { predictions: predCount, comments: _count.comments },
          fomo: stats ?? {
            countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
            participantsCount: predCount,
            votesVelocity: 0,
            pointsMultiplier: 1.0,
            isClosingSoon: false,
          },
        };
      });
    }

    return NextResponse.json({ eventsByCategory: result });
  } catch (error) {
    console.error("Error fetching sport events:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento degli eventi sport." },
      { status: 500 }
    );
  }
}
