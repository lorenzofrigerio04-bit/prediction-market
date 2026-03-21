import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMatchById } from "@/lib/football-data-org/client";

export const dynamic = "force-dynamic";

function isAuthorized(
  request: NextRequest
): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isProduction = process.env.VERCEL === "1";
  if (isProduction && !cronSecret) {
    return { ok: false, status: 503, body: { error: "CRON_SECRET non configurato" } };
  }
  if (!cronSecret) return { ok: true };
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
  return { ok: true };
}

/** Status da API → valore da salvare su Event.matchStatus (solo quelli rilevanti per UI "Live") */
const MAP_STATUS: Record<string, string> = {
  SCHEDULED: "SCHEDULED",
  TIMED: "SCHEDULED",
  IN_PLAY: "IN_PLAY",
  PAUSED: "PAUSED",
  FINISHED: "FINISHED",
  SUSPENDED: "SUSPENDED",
  POSTPONED: "POSTPONED",
  CANCELLED: "CANCELLED",
};

/**
 * GET /api/cron/update-match-status
 * Aggiorna matchStatus per eventi SPORT con footballDataMatchId (non ancora risolti).
 * Consiglio: ogni 5 minuti (es. 5,20,35,50 * * * *).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    if (!auth.ok) {
      return NextResponse.json(auth.body, { status: auth.status });
    }

    const events = await prisma.event.findMany({
      where: {
        sourceType: "SPORT",
        footballDataMatchId: { not: null },
        resolved: false,
      },
      select: { id: true, footballDataMatchId: true },
    });

    let updated = 0;
    let errors = 0;

    for (const event of events) {
      const matchId = event.footballDataMatchId!;
      try {
        const match = await fetchMatchById(matchId);
        if (!match) continue;
        const status = MAP_STATUS[match.status] ?? match.status;
        await prisma.event.update({
          where: { id: event.id },
          data: { matchStatus: status },
        });
        updated++;
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checked: events.length,
      updated,
      errors,
    });
  } catch (error) {
    console.error("[cron/update-match-status] error:", error);
    return NextResponse.json(
      {
        error: "Errore aggiornamento match status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
