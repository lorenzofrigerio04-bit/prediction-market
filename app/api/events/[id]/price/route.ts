import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedPrice, setCachedPrice } from "@/lib/cache/price";
import { getEventProbability } from "@/lib/pricing/price-display";

/**
 * GET /api/events/[id]/price — current market price (probability). Cached 1s.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const cached = await getCachedPrice(eventId);
    if (cached) {
      return NextResponse.json(cached);
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        b: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    const qYes = 0;
    const qNo = 0;
    const b = event.b ?? 100;
    const probability = getEventProbability(event);

    const data = {
      eventId: event.id,
      probability,
      q_yes: qYes,
      q_no: qNo,
      b,
    };
    await setCachedPrice(eventId, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching event price:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento del prezzo" },
      { status: 500 }
    );
  }
}
