import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSimulatedActivity } from "@/lib/simulated-activity";
import { ENABLE_SIMULATED_ACTIVITY } from "@/lib/simulated-activity/config";

export const dynamic = "force-dynamic";

/**
 * Cron: esegue attività simulata (previsioni, commenti, reazioni, follow da bot).
 * Richiede: GET (o POST) + header Authorization: Bearer <CRON_SECRET> (Vercel Cron lo invia).
 * Esegue solo se ENABLE_SIMULATED_ACTIVITY === 'true'.
 */
export async function GET(request: NextRequest) {
  return handleSimulateActivity(request);
}

export async function POST(request: NextRequest) {
  return handleSimulateActivity(request);
}

async function handleSimulateActivity(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET?.trim();
    const isProduction = process.env.VERCEL === "1";

    if (isProduction && !cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET non configurato" },
        { status: 503 }
      );
    }
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ENABLE_SIMULATED_ACTIVITY) {
      return NextResponse.json(
        {
          ok: false,
          skipped: true,
          reason: "ENABLE_SIMULATED_ACTIVITY non è 'true'",
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    const result = await runSimulatedActivity(prisma);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Cron simulate-activity errore:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to run simulated activity",
        details: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
