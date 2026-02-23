import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { executeSellShares, AmmError } from "@/lib/amm/engine";

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
    const outcome = body.outcome === "YES" || body.outcome === "NO" ? body.outcome : null;
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

    const result = await prisma.$transaction((tx) =>
      executeSellShares(tx, {
        eventId,
        userId: session.user.id,
        outcome: outcome as "YES" | "NO",
        shareMicros,
        minProceedsMicros,
        idempotencyKey,
      })
    );

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
          yesShareMicros: result.position.yesShareMicros.toString(),
          noShareMicros: result.position.noShareMicros.toString(),
        },
        proceedsMicros: result.proceedsMicros.toString(),
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
    throw e;
  }
}
