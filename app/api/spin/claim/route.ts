import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    // DailySpin non ancora implementato - modello non presente nello schema Prisma
    return NextResponse.json(
      { error: "Funzionalità spin non ancora disponibile" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Errore" },
      { status: 500 }
    );
  }
}
