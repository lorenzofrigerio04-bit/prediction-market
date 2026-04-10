import { NextResponse } from "next/server";
import { SPORT_CATEGORIES } from "@/lib/sport-categories";
import { prisma } from "@/lib/prisma";
import { HOME_FEED_SOURCE_TYPE } from "@/lib/event-visibility";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/categories
 * Restituisce le categorie ammesse per la submission eventi (allineate al validator).
 */
export async function GET() {
  try {
    const dbCategories = await prisma.event.findMany({
      where: HOME_FEED_SOURCE_TYPE,
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    });

    const categories = dbCategories
      .map((row) => row.category?.trim())
      .filter((category): category is string => Boolean(category && category.length > 0));

    if (categories.length === 0) {
      return NextResponse.json({ categories: [...SPORT_CATEGORIES] });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle categorie" },
      { status: 500 }
    );
  }
}
