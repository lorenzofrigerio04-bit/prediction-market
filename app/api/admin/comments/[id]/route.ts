import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

/**
 * PATCH /api/admin/comments/[id]
 * Nascondi commento (hidden = true) con motivazione opzionale; AuditLog
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: commentId } = await params;
    const body = await request.json().catch(() => ({}));
    const { hidden, reason } = body;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return NextResponse.json({ error: "Commento non trovato" }, { status: 404 });
    }

    if (hidden === true) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { hidden: true },
      });
      await createAuditLog(prisma, {
        userId: admin.id,
        action: "COMMENT_HIDE",
        entityType: "comment",
        entityId: commentId,
        payload: { reason: reason || null, eventId: comment.eventId, contentPreview: comment.content.slice(0, 100) },
      });
    }

    return NextResponse.json({ error: "Azione non supportata" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/comments/[id]
 * Elimina commento; AuditLog
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: commentId } = await params;
    const reason = request.nextUrl.searchParams.get("reason") ?? undefined;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      return NextResponse.json({ error: "Commento non trovato" }, { status: 404 });
    }

    // Elimina prima le risposte (parentId -> questo commento), poi il commento
    await prisma.comment.deleteMany({ where: { parentId: commentId } });
    await prisma.comment.delete({ where: { id: commentId } });
    await createAuditLog(prisma, {
      userId: admin.id,
      action: "COMMENT_DELETE",
      entityType: "comment",
      entityId: commentId,
      payload: { reason: reason || null, eventId: comment.eventId, contentPreview: comment.content.slice(0, 100) },
    });
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
