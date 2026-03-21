import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sellGivenShares,
  sellGivenSharesMultiOutcome,
} from "@/lib/amm/fixedPointLmsr";
import {
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  getValidOutcomeKeys,
} from "@/lib/market-types";
import {
  getEventMarketSharesByOutcome,
} from "@/lib/amm/multi-outcome-engine";

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
    const outcome =
      typeof body.outcome === "string" && body.outcome.trim() !== ""
        ? body.outcome.trim()
        : null;
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
      select: {
        id: true,
        resolved: true,
        closesAt: true,
        tradingMode: true,
        marketType: true,
        outcomes: true,
        b: true,
      },
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

    const marketType = event.marketType ?? "BINARY";
    const isMultiOutcomeMarket =
      isMarketTypeId(marketType) &&
      MULTI_OPTION_MARKET_TYPES.includes(marketType);

    let estimatedProceedsMicros: bigint;
    if (isMultiOutcomeMarket) {
      const validOutcomeKeys = getValidOutcomeKeys(event.outcomes);
      if (!validOutcomeKeys.includes(outcome)) {
        return NextResponse.json(
          { error: `Outcome non valido. Opzioni ammesse: ${validOutcomeKeys.join(", ")}` },
          { status: 400 }
        );
      }
      const marketQ = await getEventMarketSharesByOutcome(prisma, event.id, validOutcomeKeys);
      const bMicros = BigInt(Math.max(1, Math.round((event.b ?? 1) * 1_000_000)));
      estimatedProceedsMicros = sellGivenSharesMultiOutcome(
        validOutcomeKeys,
        marketQ,
        bMicros,
        outcome,
        shareMicros
      );
    } else {
      if (outcome !== "YES" && outcome !== "NO") {
        return NextResponse.json(
          { error: "Per mercati binari outcome deve essere YES o NO" },
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

      estimatedProceedsMicros = sellGivenShares(
        amm.qYesMicros,
        amm.qNoMicros,
        amm.bMicros,
        outcome,
        shareMicros
      );
    }

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
