import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { createAuditLog } from "@/lib/audit";

const DISPUTE_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 ore

function isInDisputeWindow(resolvedAt: Date | null): boolean {
  if (!resolvedAt) return false;
  return Date.now() - resolvedAt.getTime() <= DISPUTE_WINDOW_MS;
}

/**
 * POST /api/admin/events/[id]/dispute
 * Body: { action: "APPROVE" | "REJECT" | "CORRECT", newOutcome?: "YES" | "NO" }
 * Approva = conferma risoluzione (clear dispute flag).
 * Rifiuta = segna come disputato.
 * Correggi = annulla risoluzione e riporta evento a "da risolvere" (revert payouts).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id: eventId } = await params;
    const body = await request.json();
    const { action, newOutcome } = body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        resolved: true,
        resolvedAt: true,
        outcome: true,
        tradingMode: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (!event.resolved || !event.resolvedAt) {
      return NextResponse.json(
        { error: "L'evento non è risolto" },
        { status: 400 }
      );
    }
    if (!isInDisputeWindow(event.resolvedAt)) {
      return NextResponse.json(
        { error: "Finestra dispute scaduta (2h dalla risoluzione)" },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          resolutionDisputedAt: null,
          resolutionDisputedBy: null,
        },
      });
      await createAuditLog(prisma, {
        userId: admin.id,
        action: "DISPUTE_APPROVE",
        entityType: "event",
        entityId: eventId,
      });
    }

    if (action === "REJECT") {
      await prisma.event.update({
        where: { id: eventId },
        data: {
          resolutionDisputedAt: new Date(),
          resolutionDisputedBy: admin.id,
        },
      });
      await createAuditLog(prisma, {
        userId: admin.id,
        action: "DISPUTE_REJECT",
        entityType: "event",
        entityId: eventId,
      });
    }

    if (action === "CORRECT" && (newOutcome === "YES" || newOutcome === "NO")) {
      // Revert AMM: annulla SHARE_PAYOUT (1 per share) e riporta evento non risolto
      const payouts = await prisma.transaction.findMany({
        where: {
          type: "SHARE_PAYOUT",
          referenceId: eventId,
        },
        select: { userId: true, amountMicros: true },
      });
      for (const p of payouts) {
        const amount = p.amountMicros ?? 0n;
        if (amount > 0n) {
          await prisma.user.update({
            where: { id: p.userId },
            data: { creditsMicros: { decrement: amount } },
          });
        }
        await prisma.transaction.deleteMany({
          where: {
            userId: p.userId,
            type: "SHARE_PAYOUT",
            referenceId: eventId,
          },
        });
      }
      await prisma.event.update({
        where: { id: eventId },
        data: {
          resolved: false,
          outcome: null,
          resolvedAt: null,
          resolutionDisputedAt: null,
          resolutionDisputedBy: null,
        },
      });
      await createAuditLog(prisma, {
        userId: admin.id,
        action: "DISPUTE_CORRECT",
        entityType: "event",
        entityId: eventId,
      });
      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json(
      { error: "Azione non valida. Usa APPROVE, REJECT o CORRECT (con newOutcome per CORRECT)." },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.message === "Non autenticato" || error.message?.includes("Accesso negato")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message || "Errore" }, { status: 500 });
  }
}
