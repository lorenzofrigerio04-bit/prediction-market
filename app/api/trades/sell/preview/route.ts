import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sellGivenShares } from "@/lib/amm/fixedPointLmsr";

/**
 * POST /api/trades/sell/preview
 * Body: { eventId, outcome, shareMicros }
 * Returns: { estimatedProceedsMicros } — ricavo stimato per quella vendita (solo lettura, nessun effetto).
 * Usato per mostrare P&L stimato prima di confermare la vendita.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventId = typeof body.eventId === "string" ? body.eventId.trim() : null;
    const outcome = body.outcome === "YES" || body.outcome === "NO" ? body.outcome : null;
    const shareMicrosRaw = body.shareMicros;
    const shareMicros =
      typeof shareMicrosRaw === "string"
        ? BigInt(shareMicrosRaw)
        : typeof shareMicrosRaw === "number"
          ? BigInt(Math.floor(shareMicrosRaw))
          : null;

    if (!eventId || !outcome) {
      return NextResponse.json(
        { error: "eventId e outcome sono obbligatori" },
        { status: 400 }
      );
    }
    if (shareMicros == null || shareMicros <= 0n) {
      return NextResponse.json(
        { error: "shareMicros obbligatorio e positivo" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, resolved: true, closesAt: true, tradingMode: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (event.tradingMode !== "AMM") {
      return NextResponse.json(
        { error: "Solo mercati AMM supportano la vendita" },
        { status: 400 }
      );
    }
    if (event.resolved) {
      return NextResponse.json(
        { error: "Mercato già risolto" },
        { status: 400 }
      );
    }
    if (new Date(event.closesAt) <= new Date()) {
      return NextResponse.json(
        { error: "Mercato chiuso" },
        { status: 400 }
      );
    }

    const amm = await prisma.ammState.findUnique({
      where: { eventId: event.id },
      select: { qYesMicros: true, qNoMicros: true, bMicros: true },
    });
    if (!amm) {
      return NextResponse.json(
        { error: "Stato mercato non disponibile" },
        { status: 404 }
      );
    }

    const held = outcome === "YES" ? amm.qYesMicros : amm.qNoMicros;
    if (shareMicros > held) {
      return NextResponse.json(
        { error: "Quantità superiore alle quote disponibili nel mercato" },
        { status: 400 }
      );
    }

    const estimatedProceedsMicros = sellGivenShares(
      amm.qYesMicros,
      amm.qNoMicros,
      amm.bMicros,
      outcome,
      shareMicros
    );

    return NextResponse.json({
      estimatedProceedsMicros: estimatedProceedsMicros.toString(),
    });
  } catch (error) {
    console.error("Sell preview error:", error);
    return NextResponse.json(
      { error: "Errore nel calcolo della stima" },
      { status: 500 }
    );
  }
}
