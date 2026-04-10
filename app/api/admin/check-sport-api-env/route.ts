import { NextResponse } from "next/server";
import { requireAdminCapability } from "@/lib/admin";
import { fetchMatchesInRange } from "@/lib/football-data-org/client";

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
    let apiReachable = false;
    let probeMatchesCount = 0;
    let probeError: string | null = null;

    if (configured) {
      try {
        const now = new Date();
        const dateFrom = now.toISOString().slice(0, 10);
        const to = new Date(now);
        to.setDate(to.getDate() + 30);
        const dateTo = to.toISOString().slice(0, 10);
        const matches = await fetchMatchesInRange(dateFrom, dateTo);
        apiReachable = true;
        probeMatchesCount = matches.length;
      } catch (error) {
        probeError = error instanceof Error ? error.message : String(error);
      }
    }

    return NextResponse.json({
      source: "football-data.org",
      apiTokenConfigured: configured,
      apiReachable,
      probeMatchesCount,
      probeError,
      message: configured
        ? apiReachable
          ? "FOOTBALL_DATA_ORG_API_TOKEN impostato e API raggiungibile."
          : "FOOTBALL_DATA_ORG_API_TOKEN impostato, ma la chiamata API di test non e' riuscita. Controlla probeError."
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
