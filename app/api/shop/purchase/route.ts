import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyCreditTransaction } from "@/lib/apply-credit-transaction";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per acquistare" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const itemId = body?.itemId;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { error: "itemId è obbligatorio" },
        { status: 400 }
      );
    }

    const item = await prisma.shopItem.findFirst({
      where: { id: itemId, active: true },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Prodotto non trovato o non disponibile" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utente non trovato" },
        { status: 404 }
      );
    }

    if (user.credits < item.priceCredits) {
      return NextResponse.json(
        { error: "Crediti insufficienti" },
        { status: 400 }
      );
    }

    const newCredits = await applyCreditTransaction(
      prisma,
      session.user.id,
      "SHOP_PURCHASE",
      -item.priceCredits,
      {
        referenceId: item.id,
        referenceType: "shop_item",
      }
    );

    return NextResponse.json({
      message: "Acquisto completato",
      newCredits,
    });
  } catch (error) {
    console.error("Error purchasing shop item:", error);
    return NextResponse.json(
      { error: "Errore durante l'acquisto" },
      { status: 500 }
    );
  }
}
