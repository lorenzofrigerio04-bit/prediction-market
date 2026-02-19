import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/categories
 * Restituisce l'elenco delle categorie distinte dagli eventi (esclusi News e event-generator).
 */
export async function GET() {
  try {
    const rows = await prisma.event.findMany({
      where: {
        category: { not: "News" },
        NOT: { createdBy: { email: "event-generator@system" } },
      },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    const categories = rows.map((r) => r.category).filter(Boolean);
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle categorie" },
      { status: 500 }
    );
  }
}
