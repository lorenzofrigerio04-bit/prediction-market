import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.shopItem.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
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
