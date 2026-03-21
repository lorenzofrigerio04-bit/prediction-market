import { NextResponse } from "next/server";
import { SPORT_CATEGORIES } from "@/lib/sport-categories";

export const dynamic = "force-dynamic";

/**
 * GET /api/events/categories
 * Restituisce le categorie ammesse per la submission eventi (allineate al validator).
 */
export async function GET() {
  try {
    const categories = [...SPORT_CATEGORIES];
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle categorie" },
      { status: 500 }
    );
  }
}
