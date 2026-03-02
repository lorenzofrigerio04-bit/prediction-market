import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/[id]/predictions-count
 * Restituisce solo il numero di previsioni (Prediction + Trade) per aggiornamenti in tempo reale.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        _count: {
          select: { Prediction: true, Trade: true },
        },
      },
    });
    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }
    const count =
      (event._count.Prediction ?? 0) + ((event._count as { Trade?: number }).Trade ?? 0);
    return NextResponse.json({ predictionsCount: count });
  } catch (error) {
    console.error("predictions-count error:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento" },
      { status: 500 }
    );
  }
}
