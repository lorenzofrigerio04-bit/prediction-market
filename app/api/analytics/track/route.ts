import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { persistMarketAnalyticsRaw } from "@/lib/analytics/persist-raw";

/**
 * POST /api/analytics/track
 * Body: { event: AnalyticsEvent, properties?: Record<string, unknown> }
 * Usato dal client per eventi view (EVENT_VIEWED, LEADERBOARD_VIEWED, ecc.).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({}));
    const { event, properties = {} } = body as {
      event: AnalyticsEvent;
      properties?: Record<string, unknown>;
    };

    if (!event || typeof event !== "string") {
      return NextResponse.json(
        { error: "event è obbligatorio" },
        { status: 400 }
      );
    }

    const validEvents: AnalyticsEvent[] = [
      "USER_SIGNUP",
      "ONBOARDING_COMPLETE",
      "EVENT_VIEWED",
      "EVENT_CLICKED",
      "EVENT_FOLLOWED",
      "PREDICTION_PLACED",
      "COMMENT_POSTED",
      "REACTION_ADDED",
      "EVENT_RESOLVED_VIEWED",
      "MISSION_VIEWED",
      "MISSION_COMPLETED",
      "DAILY_BONUS_CLAIMED",
      "LEADERBOARD_VIEWED",
      "PROFILE_VIEWED",
    ];
    if (!validEvents.includes(event as AnalyticsEvent)) {
      return NextResponse.json(
        { error: "event non valido" },
        { status: 400 }
      );
    }

    track(event as AnalyticsEvent, {
      ...properties,
      userId: session?.user?.id ?? (properties.userId as string),
    } as Record<string, string | number | boolean | undefined>, {
      request,
    });

    const eventId = properties.eventId as string | undefined;
    if (eventId && typeof eventId === "string" && (event === "EVENT_VIEWED" || event === "EVENT_CLICKED")) {
      persistMarketAnalyticsRaw({
        eventId,
        userId: session?.user?.id ?? undefined,
        eventType: event === "EVENT_VIEWED" ? "impression" : "click",
      }).catch((e) => console.error("[analytics] persist raw error:", e));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics] track API error:", e);
    return NextResponse.json(
      { error: "Errore nell'invio dell'evento" },
      { status: 500 }
    );
  }
}
