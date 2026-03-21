import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchEventToOdds } from "@/lib/odds/event-matcher";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]/odds
 * Ritorna le quote bookmaker se l'evento è matchabile con The Odds API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, category: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }

    const result = await matchEventToOdds(event.title, event.category);

    if (!result.matched) {
      return NextResponse.json({ matched: false });
    }

    return NextResponse.json({
      matched: true,
      odds: {
        eventId: result.eventId,
        homeTeam: result.homeTeam,
        awayTeam: result.awayTeam,
        yesTeam: result.yesTeam,
        noTeam: result.noTeam,
        commenceTime: result.commenceTime,
        sportTitle: result.sportTitle,
        bookmakers: result.bookmakers,
        bestYes: result.bestYes,
        bestNo: result.bestNo,
      },
    });
  } catch (err) {
    console.warn("[Odds API] Error:", err);
    return NextResponse.json(
      { matched: false, error: "Errore nel recupero delle quote" },
      { status: 500 }
    );
  }
}
