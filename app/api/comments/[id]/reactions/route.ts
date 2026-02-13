import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Add or toggle a reaction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato per reagire" },
        { status: 401 }
      );
    }

    const commentId = params.id;
    const body = await request.json();
    const { type } = body;

    // Validazione tipo reazione
    const validTypes = ["THUMBS_UP", "FIRE", "HEART"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Tipo di reazione non valido" },
        { status: 400 }
      );
    }

    // Verifica che il commento esista
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: "Commento non trovato" },
        { status: 404 }
      );
    }

    // Verifica se l'utente ha già questa reazione su questo commento
    const existingReaction = await prisma.commentReaction.findFirst({
      where: {
        userId: session.user.id,
        commentId,
        type,
      },
    });

    if (existingReaction) {
      // Rimuovi la reazione (toggle off)
      await prisma.commentReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return NextResponse.json({
        success: true,
        action: "removed",
        message: "Reazione rimossa",
      });
    } else {
      // Aggiungi la reazione
      await prisma.commentReaction.create({
        data: {
          userId: session.user.id,
          commentId,
          type,
        },
      });

      return NextResponse.json({
        success: true,
        action: "added",
        message: "Reazione aggiunta",
      });
    }
  } catch (error: any) {
    console.error("Error toggling reaction:", error);

    if (error.code === "P2002") {
      // Unique constraint violation - reaction already exists
      return NextResponse.json(
        { error: "Reazione già presente" },
        { status: 400 }
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Commento o utente non trovato" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Errore nell'aggiunta della reazione" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a reaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi essere autenticato" },
        { status: 401 }
      );
    }

    const commentId = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Tipo di reazione è obbligatorio" },
        { status: 400 }
      );
    }

    // Trova e rimuovi la reazione
    const reaction = await prisma.commentReaction.findFirst({
      where: {
        userId: session.user.id,
        commentId,
        type,
      },
    });

    if (!reaction) {
      return NextResponse.json(
        { error: "Reazione non trovata" },
        { status: 404 }
      );
    }

    await prisma.commentReaction.delete({
      where: {
        id: reaction.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reazione rimossa",
    });
  } catch (error) {
    console.error("Error deleting reaction:", error);
    return NextResponse.json(
      { error: "Errore nella rimozione della reazione" },
      { status: 500 }
    );
  }
}
