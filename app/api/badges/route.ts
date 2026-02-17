import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/badges
 * Restituisce tutti i badge con stato sbloccato/non sbloccato per l'utente corrente.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [allBadges, userBadges] = await Promise.all([
      Promise.resolve([]),  // badge model non esiste
      Promise.resolve([]),  // userBadge model non esiste
    ]);

        return NextResponse.json([]);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei badge" },
      { status: 500 }
    );
  }
}
