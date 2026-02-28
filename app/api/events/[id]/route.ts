import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setCachedPrice } from "@/lib/cache/price";
import { DEFAULT_B } from "@/lib/pricing/initialization";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
            Trade: true,
            comments: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    const amm = await prisma.ammState.findUnique({ where: { eventId: event.id } });
    let probability = 50;
    if (amm) {
      const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
      probability = Number((yesMicros * 100n) / SCALE);
    }
    setCachedPrice(eventId, { eventId: event.id, probability, q_yes: 0, q_no: 0, b: DEFAULT_B }).catch(() => {});
    (event as { probability?: number }).probability = probability;

    let userPosition: { yesShareMicros: string; noShareMicros: string; positionCostMicros?: string; positionYesCostMicros?: string; positionNoCostMicros?: string } | null = null;
    let tradeHistory: { id: string; side: string; outcome: string; shareMicros: string; costMicros: string; createdAt: string; realizedPlMicros: string | null }[] = [];
    let isFollowing = false;
    if (session?.user?.id) {
      const [follow, position, costBySide, history] = await Promise.all([
        prisma.eventFollower.findUnique({
          where: {
            userId_eventId: { userId: session.user.id, eventId: event.id },
          },
        }),
        prisma.position.findUnique({
          where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
          select: { yesShareMicros: true, noShareMicros: true },
        }),
        prisma.trade
          .findMany({
            where: {
              eventId: event.id,
              userId: session.user.id,
              side: "BUY",
            },
            select: { costMicros: true, outcome: true },
          })
          .then((trades) => {
            let total = 0n;
            let yesCost = 0n;
            let noCost = 0n;
            for (const t of trades) {
              const abs = t.costMicros < 0n ? -t.costMicros : t.costMicros;
              total += abs;
              if (t.outcome === "YES") yesCost += abs;
              else if (t.outcome === "NO") noCost += abs;
            }
            return { total, yesCost, noCost };
          }),
        prisma.trade.findMany({
          where: { eventId: event.id, userId: session.user.id },
          orderBy: { createdAt: "desc" },
          select: { id: true, side: true, outcome: true, shareMicros: true, costMicros: true, createdAt: true, realizedPlMicros: true },
        }),
      ]);
      isFollowing = !!follow;
      tradeHistory = history.map((t) => ({
        id: t.id,
        side: t.side,
        outcome: t.outcome,
        shareMicros: t.shareMicros.toString(),
        costMicros: t.costMicros.toString(),
        createdAt: t.createdAt.toISOString(),
        realizedPlMicros: t.realizedPlMicros != null ? t.realizedPlMicros.toString() : null,
      }));

      // Cost basis residuo: sottrae il cost basis già "consumato" nelle vendite parziali,
      // così "HAI: X quote acquistate per Y crediti" e P&L si riferiscono solo alle quote ancora possedute.
      let remainingYesCostMicros = costBySide.yesCost;
      let remainingNoCostMicros = costBySide.noCost;
      for (const t of history) {
        if (t.side !== "SELL" || t.realizedPlMicros == null) continue;
        const proceedsMicros = t.costMicros > 0n ? t.costMicros : -t.costMicros;
        const costBasisUsedMicros = proceedsMicros - t.realizedPlMicros;
        if (t.outcome === "YES") {
          remainingYesCostMicros =
            remainingYesCostMicros - costBasisUsedMicros > 0n
              ? remainingYesCostMicros - costBasisUsedMicros
              : 0n;
        } else {
          remainingNoCostMicros =
            remainingNoCostMicros - costBasisUsedMicros > 0n
              ? remainingNoCostMicros - costBasisUsedMicros
              : 0n;
        }
      }
      const totalRemainingCostMicros = remainingYesCostMicros + remainingNoCostMicros;

      if (position) {
        userPosition = {
          yesShareMicros: position.yesShareMicros.toString(),
          noShareMicros: position.noShareMicros.toString(),
          positionCostMicros: totalRemainingCostMicros.toString(),
          positionYesCostMicros: remainingYesCostMicros.toString(),
          positionNoCostMicros: remainingNoCostMicros.toString(),
        };
      }
    }

    const { _count, ...eventRest } = event;
    const predictionsCount = (_count.Prediction ?? 0) + ((_count as { Trade?: number }).Trade ?? 0);
    const eventForClient = {
      ...eventRest,
      _count: { predictions: predictionsCount, comments: _count.comments },
    };

    const res = NextResponse.json({
      event: eventForClient,
      userPrediction: null,
      userPosition,
      tradeHistory,
      isFollowing,
    });
    res.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
    return res;
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'evento" },
      { status: 500 }
    );
  }
}

/** PATCH: solo il creatore può aggiornare il proprio evento (campi editabili). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, createdById: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (event.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Non puoi modificare un evento creato da altri" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { title, description, category, closesAt, resolutionSourceUrl } = body;
    const data: { title?: string; description?: string | null; category?: string; closesAt?: Date; resolutionSourceUrl?: string | null } = {};
    if (title !== undefined) data.title = typeof title === "string" ? title.trim() : "";
    if (description !== undefined) data.description = description == null || description === "" ? null : String(description).trim();
    if (category !== undefined) data.category = typeof category === "string" ? category.trim() : "";
    if (closesAt !== undefined) data.closesAt = new Date(closesAt);
    if (resolutionSourceUrl !== undefined) data.resolutionSourceUrl = resolutionSourceUrl == null || resolutionSourceUrl === "" ? null : String(resolutionSourceUrl).trim();
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true });
    }
    await prisma.event.update({
      where: { id: eventId },
      data,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento dell'evento" },
      { status: 500 }
    );
  }
}

/** DELETE: solo il creatore può eliminare il proprio evento (cascade su relazioni). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, createdById: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (event.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Non puoi eliminare un evento creato da altri" },
        { status: 403 }
      );
    }
    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'evento" },
      { status: 500 }
    );
  }
}
