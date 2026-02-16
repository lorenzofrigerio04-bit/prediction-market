import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCachedPrice, setCachedPrice } from "@/lib/cache/price";
import { getEventProbability } from "@/lib/pricing/price-display";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const eventId = params.id;

    // Optional: use cached price for probability if fresh (1s TTL)
    let cachedPrice = await getCachedPrice(eventId);

    // Fetch event with all related data
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
            predictions: true,
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

    // Set price cache (1s TTL) for /api/events/[id]/price and future requests
    const priceData = {
      eventId: event.id,
      probability: getEventProbability(event),
      q_yes: event.q_yes ?? 0,
      q_no: event.q_no ?? 0,
      b: event.b ?? 100,
    };
    setCachedPrice(eventId, priceData).catch(() => {});

    // Override probability with cached value if we had a fresh cache (consistent with price endpoint)
    if (cachedPrice) {
      (event as { probability?: number }).probability = cachedPrice.probability;
    } else {
      (event as { probability?: number }).probability = priceData.probability;
    }

    // Get user's prediction and follow status if logged in
    let userPrediction = null;
    let isFollowing = false;
    if (session?.user?.id) {
      const [pred, follow] = await Promise.all([
        prisma.prediction.findUnique({
          where: {
            userId_eventId: {
              userId: session.user.id,
              eventId: event.id,
            },
          },
        }),
        prisma.eventFollower.findUnique({
          where: {
            userId_eventId: {
              userId: session.user.id,
              eventId: event.id,
            },
          },
        }),
      ]);
      userPrediction = pred;
      isFollowing = !!follow;
    }

    return NextResponse.json({
      event,
      userPrediction,
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
