import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateMissionProgress } from "@/lib/missions";
import { checkAndAwardBadges } from "@/lib/badges";
import { rateLimit } from "@/lib/rate-limit";
import { track } from "@/lib/analytics";
import { executePredictionBuy, TradeError } from "@/lib/pricing/trade";
import { updateUserProfileFromTrade } from "@/lib/personalization";
import { invalidatePriceCache } from "@/lib/cache/price";
import { invalidateTrendingCache } from "@/lib/cache/trending";
import { invalidateFeedCache } from "@/lib/feed-cache";

const PREDICTIONS_LIMIT = 15; // previsioni per user per minuto

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per fare una previsione" },
        { status: 401 }
      );
    }

    const limited = rateLimit(`predictions:${session.user.id}`, PREDICTIONS_LIMIT);
    if (limited) {
      return NextResponse.json(
        { error: "Troppe previsioni in poco tempo. Riprova tra un minuto." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { eventId, outcome, credits } = body;

    // Validazione
    if (!eventId || !outcome || !credits) {
      return NextResponse.json(
        { error: "EventId, outcome e credits sono obbligatori" },
        { status: 400 }
      );
    }

    if (outcome !== "YES" && outcome !== "NO") {
      return NextResponse.json(
        { error: "Outcome deve essere YES o NO" },
        { status: 400 }
      );
    }

    if (credits < 1) {
      return NextResponse.json(
        { error: "Devi investire almeno 1 credito" },
        { status: 400 }
      );
    }

    // Verifica che l'evento esista (per 404 e per passare al trade)
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        category: true,
        resolved: true,
        closesAt: true,
        q_yes: true,
        q_no: true,
        b: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    // Esegue trade LMSR in transazione atomica (validazione mercato aperto, crediti, creazione prediction, update event, deduzione crediti)
    let result: Awaited<ReturnType<typeof executePredictionBuy>>;
    try {
      result = await prisma.$transaction((tx) =>
        executePredictionBuy(tx, {
          event: {
            id: event.id,
            title: event.title,
            category: event.category,
            resolved: event.resolved,
            closesAt: event.closesAt,
            q_yes: event.q_yes,
            q_no: event.q_no,
            b: event.b,
          },
          userId: session.user.id,
          outcome: outcome as "YES" | "NO",
          creditsToSpend: credits,
        })
      );
    } catch (err) {
      if (err instanceof TradeError) {
        const status =
          err.code === "MARKET_CLOSED" || err.code === "MARKET_RESOLVED" || err.code === "INSUFFICIENT_CREDITS" || err.code === "ALREADY_PREDICTED"
            ? 400
            : err.code === "USER_NOT_FOUND"
              ? 404
              : 400;
        return NextResponse.json({ error: err.message }, { status });
      }
      throw err;
    }

    // Missioni e badge (fuori dalla transazione per non bloccare la risposta)
    const userId = session.user.id;
    updateMissionProgress(prisma, userId, "MAKE_PREDICTIONS", 1, event.category).catch((e) =>
      console.error("Mission progress update error:", e)
    );
    checkAndAwardBadges(prisma, userId).catch((e) =>
      console.error("Badge check error:", e)
    );
    updateUserProfileFromTrade(prisma, userId).catch((e) =>
      console.error("User profile update error:", e)
    );

    track(
      "PREDICTION_PLACED",
      {
        userId,
        eventId: event.id,
        amount: result.actualCostPaid,
        outcome,
        category: event.category,
      },
      { request }
    );

    // Invalidate caches: price for this event, trending list, and this user's feed
    Promise.all([
      invalidatePriceCache(event.id),
      invalidateTrendingCache(),
      invalidateFeedCache(userId),
    ]).catch((e) => console.error("Cache invalidation error:", e));

    return NextResponse.json(
      {
        success: true,
        prediction: result.prediction,
        message: "Previsione creata con successo",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating prediction:", error);

    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Hai già fatto una previsione per questo evento" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Errore nella creazione della previsione" },
      { status: 500 }
    );
  }
}
