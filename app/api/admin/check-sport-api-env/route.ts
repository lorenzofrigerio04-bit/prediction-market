import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/lib/admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/check-sport-api-env
 * Diagnostica: verifica la configurazione per la pipeline sport (football-data.org).
 * Solo admin. Token obbligatorio (free: 10 req/min, 12 competizioni).
 */
export async function GET() {
  try {
    await requireAdminCapability("pipeline:run");

    const token = process.env.FOOTBALL_DATA_ORG_API_TOKEN;
    const configured = typeof token === "string" && token.trim().length > 0;

    return NextResponse.json({
      source: "football-data.org",
      apiTokenConfigured: configured,
      message: configured
        ? "FOOTBALL_DATA_ORG_API_TOKEN impostato. La pipeline sport e la risoluzione automatica usano football-data.org."
        : "Imposta FOOTBALL_DATA_ORG_API_TOKEN in .env (registrazione gratuita su football-data.org).",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
