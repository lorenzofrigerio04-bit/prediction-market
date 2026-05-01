import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

/**
 * DELETE /api/admin/users/[id]
 * Elimina un utente (solo admin). Eventi creati dall'utente passano al creatore della richiesta.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireAdminCapability("users:delete");
    const { id } = await params;

    if (id === actor.id) {
      return NextResponse.json(
        { error: "Non puoi eliminare il tuo stesso account da qui." },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Non è consentito eliminare un altro account amministratore." },
        { status: 403 }
      );
    }

    const reassigned = await prisma.$transaction(async (tx) => {
      await tx.eventFeedback.deleteMany({ where: { userId: id } });
      const updated = await tx.event.updateMany({
        where: { createdById: id },
        data: { createdById: actor.id },
      });
      await tx.user.delete({ where: { id } });
      return updated.count;
    });

    await createAuditLog(prisma, {
      userId: actor.id,
      action: "USER_DELETE",
      entityType: "user",
      entityId: id,
      payload: {
        deletedEmail: target.email,
        eventsReassignedToActor: reassigned,
      },
    });

    return NextResponse.json({ ok: true, eventsReassigned: reassigned });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "Non autenticato" || msg.includes("Accesso negato")) {
      return NextResponse.json({ error: msg }, { status: 403 });
    }
    console.error("[admin/users DELETE]", error);
    return NextResponse.json(
      { error: "Impossibile eliminare l'utente. Verifica vincoli sul database." },
      { status: 500 }
    );
  }
}
