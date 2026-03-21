import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";
import type { SistemaEvent, UnifiedFeedItem } from "@/types/home-unified-feed";

export const dynamic = "force-dynamic";

const EVENTS_LIMIT = 48;

/**
 * GET /api/feed/home-unified
 * Feed homepage (utente loggato): solo eventi notizie (sourceType null o NEWS).
 * Gli eventi sport (sourceType=SPORT) non compaiono qui, solo in /sport.
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();

    const eventsRaw = await prisma.event.findMany({
      where: {
        ...HOME_FEED_SOURCE_TYPE,
        resolved: false,
        closesAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      take: EVENTS_LIMIT,
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

    const sistemaEvents: SistemaEvent[] = eventsRaw.map((e) => {
      const predCount = predictionsCount(e._count as { Prediction: number; Trade: number });
      let probability = 50;
      if (e.ammState) {
        const yesMicros = priceYesMicros(
          e.ammState.qYesMicros,
          e.ammState.qNoMicros,
          e.ammState.bMicros
        );
        probability = Number((yesMicros * 100n) / SCALE);
      }
      const aiImageUrl = e.posts?.[0]?.aiImageUrl ?? null;
      return {
        id: e.id,
        title: e.title,
        category: e.category ?? "Altro",
        closesAt: e.closesAt.toISOString(),
        yesPct: Math.round(probability ?? 50),
        predictionsCount: predCount,
        aiImageUrl: aiImageUrl || undefined,
      };
    });

    const items: UnifiedFeedItem[] = sistemaEvents.map((data) => ({
      type: "sistema" as const,
      data,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Feed home-unified error:", message);
    return NextResponse.json(
      { error: "Errore nel caricamento del feed" },
      { status: 500 }
    );
  }
}
