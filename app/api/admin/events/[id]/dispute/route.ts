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
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const eventId = params.id;
    const body = await request.json();
    const { action, newOutcome } = body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { Prediction: { where: { resolved: true } } },
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
      // Revert: ripristina crediti e previsioni, poi imposta evento non risolto
      const winningOutcome = event.outcome!;
      for (const p of event.Prediction) {
        if (p.won && p.payout != null) {
          await prisma.user.update({
            where: { id: p.userId },
            data: {
              credits: { decrement: p.payout },
              totalEarned: { decrement: p.payout },
            },
          });
          await prisma.transaction.deleteMany({
            where: {
              userId: p.userId,
              type: "PREDICTION_WIN",
            },
          });
        }
        await prisma.prediction.update({
          where: { id: p.id },
          data: {
            resolved: false,
            won: null,
            payout: null,
          },
        });
      }
      await prisma.event.update({
        where: { id: eventId },
        data: {
          resolved: false,
          outcome: null,
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
