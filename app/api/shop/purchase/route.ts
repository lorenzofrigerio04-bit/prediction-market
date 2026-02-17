import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    // Shop non ancora implementato - modello ShopItem non presente nello schema Prisma
    return NextResponse.json(
      { error: "Il negozio non è ancora disponibile" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error purchasing shop item:", error);
    return NextResponse.json(
      { error: "Errore durante l'acquisto" },
      { status: 500 }
    );
  }
}
