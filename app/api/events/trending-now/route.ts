import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventsWithStats } from "@/lib/fomo/event-stats";
import { DEBUG_TITLE_PREFIX } from "@/lib/debug-display";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/trending-now
 * 
 * Restituisce eventi ordinati per votesVelocity (desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const now = new Date();

    // Recupera eventi aperti
    const events = await prisma.event.findMany({
      where: {
        resolved: false,
        closesAt: {
          gt: now,
        },
        // Hide debug-only markets
      },
      take: limit * 2, // Prendi più eventi per poi filtrare/ordinare per votesVelocity
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

    // Calcola statistiche FOMO per tutti gli eventi
    const eventIds = events.map((e) => e.id);
    const fomoStats = await getEventsWithStats(prisma, eventIds, now);

    // Aggiungi statistiche FOMO e ordina per votesVelocity
    const eventsWithStats = events
      .map((event) => {
        const stats = fomoStats.get(event.id);
        return {
          ...event,
          fomo: stats || {
            countdownMs: new Date(event.closesAt).getTime() - now.getTime(),
            participantsCount: event._count.Prediction,
            votesVelocity: 0,
            pointsMultiplier: 1.0,
            isClosingSoon: false,
          },
        };
      })
      .sort((a, b) => {
        // Ordina per votesVelocity desc
        const velocityA = a.fomo.votesVelocity;
        const velocityB = b.fomo.votesVelocity;
        if (velocityA !== velocityB) {
          return velocityB - velocityA;
        }
        // Se votesVelocity è uguale, ordina per participantsCount desc
        return (b.fomo.participantsCount || 0) - (a.fomo.participantsCount || 0);
      })
      .slice(0, limit); // Prendi solo i primi N

    return NextResponse.json({
      events: eventsWithStats,
      count: eventsWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching trending events:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending events" },
      { status: 500 }
    );
  }
}
