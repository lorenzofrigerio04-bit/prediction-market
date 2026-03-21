import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";

export const dynamic = "force-dynamic";

const EVENTS_PER_SECTION = 12;

export interface HomeSectionEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  _count?: { predictions: number };
  aiImageUrl?: string | null;
}

/**
 * GET /api/feed/home
 * Eventi in tendenza per la Home: solo eventi notizie (sourceType null o NEWS).
 * Gli eventi sport (sourceType=SPORT) compaiono solo in /sport.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(EVENTS_PER_SECTION), 10) ||
        EVENTS_PER_SECTION,
      24
    );

    const now = new Date();

    const eventsRaw = await prisma.event.findMany({
      where: {
        ...HOME_FEED_SOURCE_TYPE,
        resolved: false,
        closesAt: { gt: now },
      },
      orderBy: [{ closesAt: "asc" }, { createdAt: "desc" }],
      take: 100,
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

    const sections = [
      {
        category: "Eventi in tendenza",
        events: events.slice(0, limit).map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category,
          closesAt: e.closesAt,
          yesPct: Math.round(e.probability ?? 50),
          predictionsCount: e._count?.predictions,
          aiImageUrl: (e as { posts?: { aiImageUrl: string | null }[] }).posts?.[0]?.aiImageUrl ?? undefined,
        })),
      },
    ].filter((s) => s.events.length > 0);

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
