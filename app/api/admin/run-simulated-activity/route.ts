import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { runSimulatedActivity } from "@/lib/simulated-activity";
import { ENABLE_SIMULATED_ACTIVITY } from "@/lib/simulated-activity/config";

/**
 * POST /api/admin/run-simulated-activity
 * Solo admin. Esegue subito una run di attività simulata (bot: previsioni, commenti, reazioni, follow).
 * Utile per vedere i bot senza aspettare il cron. Richiede ENABLE_SIMULATED_ACTIVITY=true in env.
 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Accesso negato: richiesti privilegi admin" },
      { status: 401 }
    );
  }

  if (!ENABLE_SIMULATED_ACTIVITY) {
    return NextResponse.json(
      {
        ok: false,
        error: "Attività simulata disabilitata",
        hint: "Imposta ENABLE_SIMULATED_ACTIVITY=true nelle variabili d'ambiente (Vercel / .env)",
      },
      { status: 400 }
    );
  }

  try {
    const result = await runSimulatedActivity(prisma);
    return NextResponse.json(result);
  } catch (error) {
    console.error("run-simulated-activity errore:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Errore durante l'esecuzione",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
