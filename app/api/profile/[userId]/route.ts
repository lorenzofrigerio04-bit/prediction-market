import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/profile/[userId]
 * Profilo pubblico: nome, avatar, accuratezza, serie, previsioni (senza crediti/email).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        streakCount: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      image: user.image,
      streak: user.streakCount,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento del profilo" },
      { status: 500 }
    );
  }
}
