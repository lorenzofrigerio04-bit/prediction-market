import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

/**
 * POST /api/events/resolve-closed
 *
 * NON risolve più gli eventi in automatico (l'esito deve essere verificato dalla fonte
 * e impostato da un admin). Restituisce solo l'elenco degli eventi chiusi e non ancora
 * risolti, così il cron può segnalarli e l'admin può risolverli dalla UI "Risoluzione".
 *
 * Autorizzato: admin (sessione) oppure cron con Authorization: Bearer CRON_SECRET
 * (il cron usa questa risposta per monitoraggio; la risoluzione avviene da /api/admin/events/[id]/resolve).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuth) {
      try {
        await requireAdmin();
      } catch {
        return NextResponse.json(
          {
            error:
              "Non autenticato o accesso negato. Richiesti privilegi admin o CRON_SECRET.",
          },
          { status: 401 }
        );
      }
    }

    const now = new Date();

    const pendingEvents = await prisma.event.findMany({
      where: {
        closesAt: { lte: now },
        resolved: false,
      },
      select: {
        id: true,
        title: true,
        closesAt: true,
      },
      orderBy: { closesAt: "asc" },
    });

    return NextResponse.json({
      message:
        pendingEvents.length === 0
          ? "Nessun evento chiuso in attesa di risoluzione"
          : `${pendingEvents.length} evento/i chiusi in attesa di risoluzione (verificare dalla fonte e risolvere da Admin → Risoluzione)`,
      processed: 0,
      pendingResolutionCount: pendingEvents.length,
      pendingResolutionIds: pendingEvents.map((e) => e.id),
      pendingResolution: pendingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        closesAt: e.closesAt,
      })),
    });
  } catch (error) {
    console.error("Errore in resolve-closed:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero eventi in attesa di risoluzione",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
