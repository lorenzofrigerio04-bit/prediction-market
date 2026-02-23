import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCachedPrice, setCachedPrice } from "@/lib/cache/price";
import { getEventProbability } from "@/lib/pricing/price-display";
import { priceYesMicros, SCALE } from "@/lib/amm/fixedPointLmsr";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const eventId = params.id;

    let cachedPrice = await getCachedPrice(eventId);

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

    let probability: number;
    if (event.tradingMode === "AMM") {
      const amm = await prisma.ammState.findUnique({ where: { eventId: event.id } });
      if (amm) {
        const yesMicros = priceYesMicros(amm.qYesMicros, amm.qNoMicros, amm.bMicros);
        probability = Number((yesMicros * 100n) / SCALE);
      } else {
        probability = 50;
      }
      setCachedPrice(eventId, { eventId: event.id, probability, q_yes: 0, q_no: 0, b: 100 }).catch(() => {});
    } else {
      const priceData = {
        eventId: event.id,
        probability: getEventProbability(event),
        q_yes: 0,
        q_no: 0,
        b: event.b ?? 100,
      };
      setCachedPrice(eventId, priceData).catch(() => {});
      probability = cachedPrice?.probability ?? priceData.probability;
    }
    (event as { probability?: number }).probability = probability;

    let userPrediction = null;
    let userPosition: { yesShareMicros: string; noShareMicros: string } | null = null;
    let isFollowing = false;
    if (session?.user?.id) {
      const [pred, follow, position] = await Promise.all([
        prisma.prediction.findUnique({
          where: {
            eventId_userId: { eventId: event.id, userId: session.user.id },
          },
        }),
        prisma.eventFollower.findUnique({
          where: {
            userId_eventId: { userId: session.user.id, eventId: event.id },
          },
        }),
        event.tradingMode === "AMM"
          ? prisma.position.findUnique({
              where: { eventId_userId: { eventId: event.id, userId: session.user.id } },
              select: { yesShareMicros: true, noShareMicros: true },
            })
          : Promise.resolve(null),
      ]);
      userPrediction = pred;
      isFollowing = !!follow;
      if (position) {
        userPosition = {
          yesShareMicros: position.yesShareMicros.toString(),
          noShareMicros: position.noShareMicros.toString(),
        };
      }
    }

    return NextResponse.json({
      event,
      userPrediction,
      userPosition,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'evento" },
      { status: 500 }
    );
  }
}
