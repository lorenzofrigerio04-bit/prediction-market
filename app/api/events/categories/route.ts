import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Recupera tutte le categorie uniche dagli eventi
    const events = await prisma.event.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    let categories = events.map((event) => event.category);
    categories = [...new Set(categories)].filter((c) => c !== "News");

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
