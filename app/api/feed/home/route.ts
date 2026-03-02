import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

export const dynamic = "force-dynamic";

const EVENTS_PER_CATEGORY = 8;

export interface HomeSectionEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  _count?: { predictions: number };
}

/**
 * GET /api/feed/home
 * Restituisce eventi SENZA foto AI, raggruppati per categoria.
 * Gli eventi con foto AI (35) sono mostrati nella pagina Discover (lente).
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(EVENTS_PER_CATEGORY), 10) ||
        EVENTS_PER_CATEGORY,
      20
    );

    const now = new Date();

    const eventIdsWithAiPhoto = await prisma.post
      .findMany({
        where: {
          type: "AI_IMAGE",
          aiImageUrl: { not: null },
        },
        select: { eventId: true },
        distinct: ["eventId"],
      })
      .then((rows) => new Set(rows.map((r) => r.eventId)));

    const eventsRaw = await prisma.event.findMany({
      where: {
        category: { not: "News" },
        resolved: false,
        closesAt: { gt: now },
        id: { notIn: Array.from(eventIdsWithAiPhoto) },
      },
      orderBy: [{ totalCredits: "desc" }, { createdAt: "desc" }],
      take: 500,
      include: {
        _count: { select: { Prediction: true, Trade: true } },
        ammState: {
          select: { qYesMicros: true, qNoMicros: true, bMicros: true },
        },
      },
    });

    const predictionsCount = (c: { Prediction: number; Trade?: number }) =>
      (c.Prediction ?? 0) + (c.Trade ?? 0);

    const events = eventsRaw.map((event) => {
      const { _count, ammState, ...rest } = event;
      const predCount = predictionsCount(
        _count as { Prediction: number; Trade: number }
      );
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
        _count: { predictions: predCount },
      };
    });

    const byCategory = new Map<string, typeof events>();
    for (const e of events) {
      const cat = e.category?.trim() || "Altro";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(e);
    }

    const sections = Array.from(byCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, evs]) => ({
        category,
        events: evs.slice(0, limit).map((e) => ({
            id: e.id,
            title: e.title,
            category: e.category,
            closesAt: e.closesAt,
            yesPct: Math.round(e.probability ?? 50),
            predictionsCount: e._count?.predictions,
          })),
      }))
      .filter((s) => s.events.length > 0);

    return NextResponse.json({
      sections,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("Feed home error:", message, stack ?? "");
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        error: "Errore nel caricamento del feed",
        ...(isDev && { detail: message }),
      },
      { status: 500 }
    );
  }
}
