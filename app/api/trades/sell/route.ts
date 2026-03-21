import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  executeSellShares,
  AmmError,
  type ExecuteSellSharesResult,
} from "@/lib/amm/engine";
import {
  executeSellSharesMultiOutcome,
  type ExecuteSellMultiOutcomeResult,
} from "@/lib/amm/multi-outcome-engine";
import {
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  getValidOutcomeKeys,
} from "@/lib/market-types";

/**
 * POST /api/trades/sell
 * Body: { eventId, outcome, shareMicros, minProceedsMicros?, idempotencyKey }
 * Returns: { trade, position, proceedsMicros } (BigInts as strings)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per vendere quote" },
        { status: 401 }
      );
    }

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
    const minProceedsMicrosRaw = body.minProceedsMicros;
    const minProceedsMicros =
      minProceedsMicrosRaw != null
        ? typeof minProceedsMicrosRaw === "string"
          ? BigInt(minProceedsMicrosRaw)
          : BigInt(Math.floor(minProceedsMicrosRaw))
        : undefined;
    const idempotencyKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey.trim() : null;

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
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: "idempotencyKey obbligatorio" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { marketType: true, outcomes: true },
    });
    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }
    const marketType = event.marketType ?? "BINARY";
    const isMultiOutcomeMarket =
      isMarketTypeId(marketType) &&
      MULTI_OPTION_MARKET_TYPES.includes(marketType);
    if (isMultiOutcomeMarket) {
      const validKeys = getValidOutcomeKeys(event.outcomes);
      if (!validKeys.includes(outcome)) {
        return NextResponse.json(
          { error: `Outcome non valido. Opzioni ammesse: ${validKeys.join(", ")}` },
          { status: 400 }
        );
      }
    } else if (outcome !== "YES" && outcome !== "NO") {
      return NextResponse.json(
        { error: "Per mercati binari outcome deve essere YES o NO" },
        { status: 400 }
      );
    }

    const [position, buyTradesForOutcome, sellTradesForOutcome] = await Promise.all([
      prisma.position.findUnique({
        where: { eventId_userId: { eventId, userId } },
        select: { yesShareMicros: true, noShareMicros: true },
      }),
      prisma.trade.findMany({
        where: {
          eventId,
          userId,
          side: "BUY",
          outcome,
        },
        select: { costMicros: true, shareMicros: true },
      }),
      prisma.trade.findMany({
        where: {
          eventId,
          userId,
          side: "SELL",
          outcome,
        },
        select: { shareMicros: true },
      }),
    ]);

    if (!position && !isMultiOutcomeMarket) {
      return NextResponse.json(
        { error: "Nessuna posizione su questo evento" },
        { status: 400 }
      );
    }

    const totalBoughtSharesForOutcome = buyTradesForOutcome.reduce(
      (acc, t) => acc + (t.shareMicros ?? 0n),
      0n
    );
    const totalSoldSharesForOutcome = sellTradesForOutcome.reduce(
      (acc, t) => acc + (t.shareMicros ?? 0n),
      0n
    );
    const netFromTrades = totalBoughtSharesForOutcome - totalSoldSharesForOutcome;
    const totalShareMicrosForOutcome = isMultiOutcomeMarket
      ? netFromTrades > 0n
        ? netFromTrades
        : 0n
      : (() => {
          const yesMicros = BigInt((position?.yesShareMicros ?? 0n).toString());
          const noMicros = BigInt((position?.noShareMicros ?? 0n).toString());
          return outcome === "YES" ? yesMicros : noMicros;
        })();
    if (totalShareMicrosForOutcome < shareMicros) {
      return NextResponse.json(
        { error: "Quote insufficienti da vendere" },
        { status: 400 }
      );
    }

    const costForOutcome = buyTradesForOutcome.reduce(
      (acc, t) => acc + (t.costMicros < 0n ? -t.costMicros : t.costMicros),
      0n
    );
    const costBasisMicros =
      totalShareMicrosForOutcome > 0n
        ? (costForOutcome * shareMicros) / totalShareMicrosForOutcome
        : 0n;

    const result = await prisma.$transaction(
      async (
        tx
      ): Promise<ExecuteSellSharesResult | ExecuteSellMultiOutcomeResult> => {
        if (isMultiOutcomeMarket) {
          return executeSellSharesMultiOutcome(tx, {
            eventId,
            userId,
            outcome,
            shareMicros,
            minProceedsMicros,
            idempotencyKey,
          });
        }
        return executeSellShares(tx, {
          eventId,
          userId,
          outcome: outcome as "YES" | "NO",
          shareMicros,
          minProceedsMicros,
          idempotencyKey,
        });
      }
    );

    const proceedsMicros = result.proceedsMicros;
    const realizedPlMicros = proceedsMicros - costBasisMicros;

    try {
      await prisma.trade.update({
        where: { id: result.trade.id },
        data: { realizedPlMicros },
      });
    } catch (updateErr) {
      console.error("[trades/sell] trade.update realizedPlMicros failed:", updateErr);
      // La vendita è già andata a buon fine; restituiamo 201 senza far esplodere la richiesta
    }

    return NextResponse.json(
      {
        trade: {
          id: result.trade.id,
          side: result.trade.side,
          outcome: result.trade.outcome,
          shareMicros: result.trade.shareMicros.toString(),
          costMicros: result.trade.costMicros.toString(),
          createdAt: result.trade.createdAt,
        },
        position: {
          yesShareMicros:
            "positionByOutcomeMicros" in result
              ? "0"
              : result.position.yesShareMicros.toString(),
          noShareMicros:
            "positionByOutcomeMicros" in result
              ? "0"
              : result.position.noShareMicros.toString(),
          ...("positionByOutcomeMicros" in result
            ? {
                outcomeSharesMicros: Object.fromEntries(
                  Object.entries(result.positionByOutcomeMicros).map(([k, v]) => [
                    k,
                    v.toString(),
                  ])
                ),
              }
            : {}),
        },
        proceedsMicros: result.proceedsMicros.toString(),
        costBasisMicros: costBasisMicros.toString(),
        realizedPlMicros: realizedPlMicros.toString(),
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof AmmError) {
      const status =
        e.code === "MARKET_CLOSED" || e.code === "MARKET_RESOLVED" || e.code === "INSUFFICIENT_SHARES" || e.code === "INVALID_AMOUNT"
          ? 400
          : e.code === "USER_NOT_FOUND"
            ? 404
            : 400;
      return NextResponse.json({ error: e.message }, { status });
    }
    // Evita 500 per errori "quote insufficienti" non wrappati in AmmError (es. da Prisma/DB)
    const msg = e instanceof Error ? e.message : String(e);
    if (/insufficient|quote|shares|position/i.test(msg)) {
      return NextResponse.json(
        { error: "Quote insufficienti da vendere" },
        { status: 400 }
      );
    }
    throw e;
  }
}
