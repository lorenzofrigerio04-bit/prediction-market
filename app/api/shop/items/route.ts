import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/shop/items
 * Elenco prodotti shop attivi (solo crediti virtuali).
 */
export async function GET() {
  try {
    const items = await prisma.shopItem.findMany({
      where: { active: true },
      orderBy: { priceCredits: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        priceCredits: true,
        description: true,
        active: true,
        createdAt: true,
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching shop items:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei prodotti" },
      { status: 500 }
    );
  }
}
