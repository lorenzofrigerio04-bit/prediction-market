import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";
import { DEBUG_TITLE_PREFIX } from "@/lib/debug-display";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/closing-soon
 * 
 * Restituisce eventi che chiudono entro 6 ore (expiresAt < now+6h)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const now = new Date();
    const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);

    // Filtra eventi aperti che chiudono entro 6 ore (esclusi eventi generati da pipeline)
    const events = await prisma.event.findMany({
      where: {
        resolved: false,
        closesAt: {
          gte: now,
          lte: sixHoursFromNow,
        },
        NOT: { createdBy: { email: "event-generator@system" } },
      },
      take: limit,
      orderBy: {
        closesAt: "asc", // più vicini alla scadenza prima
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            Prediction: true,
            comments: true,
          },
        },
      },
    });

    // Calcola statistiche FOMO
    const eventIds = events.map((e) => e.id);
    const fomoStats = await getEventsWithStats(prisma, eventIds, now);

    // Aggiungi statistiche FOMO
    const eventsWithStats = events.map((event) => {
      const stats = fomoStats.get(event.id);
      return {
        ...event,
        fomo: stats || {
          countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
          participantsCount: event._count.Prediction,
          votesVelocity: 0,
          pointsMultiplier: 1.0,
          isClosingSoon: true,
        },
      };
    });

    return NextResponse.json({
      events: eventsWithStats,
      count: eventsWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching closing soon events:", error);
    return NextResponse.json(
      { error: "Failed to fetch closing soon events" },
      { status: 500 }
    );
  }
}
