import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { track } from "@/lib/analytics";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json().catch(() => ({}));
    const itemId = body.itemId;

    if (!itemId || typeof itemId !== "string") {
      return NextResponse.json(
        { error: "Prodotto non valido" },
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
      where: { id: userId },
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

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: item.priceCredits },
          totalSpent: { increment: item.priceCredits },
        },
        select: { credits: true },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: "SHOP_PURCHASE",
          amount: -item.priceCredits,
          description: `Acquisto: ${item.name}`,
          referenceId: item.id,
          referenceType: "shop_item",
          balanceAfter: updatedUser.credits,
        },
      });

      return updatedUser;
    });

    track("SHOP_PURCHASED", {
      userId,
      item: item.name,
      itemId: item.id,
      priceCredits: item.priceCredits,
    });

    return NextResponse.json({
      success: true,
      message: `Hai acquistato "${item.name}".`,
      newCredits: updated.credits,
    });
  } catch (error) {
    console.error("Error purchasing shop item:", error);
    return NextResponse.json(
      { error: "Errore durante l'acquisto" },
      { status: 500 }
    );
  }
}
