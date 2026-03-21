import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireAdminCapability } from "@/lib/admin";
import { validateEventSubmission } from "@/lib/event-submission/validate";
import { toCandidateDraftContract } from "@/lib/integration/adapters/candidate-submission-adapter";
import { manualDraftToCandidate } from "@/lib/integration/adapters/manual-submission-to-candidate-adapter";
import { validateAgainstMdeContract } from "@/lib/integration/adapters/market-design-shadow-validator";
import { validateCandidates } from "@/lib/event-gen-v2/rulebook-validator";
import { scoreCandidate } from "@/lib/event-publishing/scoring";
import { publishSelectedV2 } from "@/lib/event-gen-v2/publisher";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/operations/submissions/[id]/approve
 * Admin-only: load a PENDING submission, re-run validation and rulebook, then publish via MDE.
 * On success: submission status → APPROVED, eventId set, event attributed to original submitter.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
    }
    await requireAdminCapability("events:create");

    const { id: submissionId } = await params;

    const submission = await prisma.eventSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Submission non trovata." },
        { status: 404 }
      );
    }

    if (submission.status !== "PENDING") {
      return NextResponse.json(
        { error: `Submission non in stato PENDING (stato: ${submission.status}).` },
        { status: 400 }
      );
    }

    if (submission.eventId) {
      return NextResponse.json(
        { error: "Submission già collegata a un evento." },
        { status: 400 }
      );
    }

    const candidateDraft = toCandidateDraftContract({
      title: submission.title,
      description: submission.description,
      category: submission.category,
      closesAt: submission.closesAt,
      resolutionSource: submission.resolutionSource,
      notifyPhone: submission.notifyPhone,
    });

    const validation = await validateEventSubmission({
      title: candidateDraft.title,
      description: candidateDraft.description,
      category: candidateDraft.category,
      closesAt: candidateDraft.closesAt,
      resolutionSource: candidateDraft.resolutionSourceUrl,
    });

    const mdeShadow = validateAgainstMdeContract(candidateDraft);
    const mdeEnforceValidation = process.env.MDE_ENFORCE_VALIDATION === "true";
    const mdeValidationBlocked = !mdeShadow.valid && mdeEnforceValidation;

    if (!validation.valid || !validation.normalizedCategory || !validation.dedupKey) {
      return NextResponse.json(
        {
          error: "Validazione fallita.",
          details: validation.errors ?? [],
        },
        { status: 400 }
      );
    }

    if (mdeValidationBlocked && mdeShadow.reason) {
      return NextResponse.json(
        { error: "Validazione MDE shadow fallita.", details: mdeShadow.reason },
        { status: 400 }
      );
    }

    const candidate = manualDraftToCandidate(
      candidateDraft,
      validation.normalizedCategory
    );
    const rulebookResult = validateCandidates([candidate]);

    if (rulebookResult.valid.length === 0) {
      const firstReject = rulebookResult.rejected[0];
      return NextResponse.json(
        {
          error: "Rulebook ha rifiutato il candidato.",
          details: firstReject?.reason ?? "Rulebook MDE ha rifiutato il candidato.",
        },
        { status: 400 }
      );
    }

    const storylineStats = { momentum: 50, novelty: 50 };
    const scored = scoreCandidate(rulebookResult.valid[0], storylineStats);
    const now = new Date();
    const publishResult = await publishSelectedV2(prisma, [scored], now, {
      createdById: submission.submittedById,
    });

    if (
      !publishResult.eventIds ||
      publishResult.eventIds.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Pubblicazione non ha creato evento (es. dedup/skip).",
          details: publishResult.reasonsCount,
        },
        { status: 400 }
      );
    }

    const eventId = publishResult.eventIds[0];

    await prisma.eventSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        eventId,
        reviewedAt: now,
        reviewedById: session.user.id,
        reviewNotes: null,
      },
    });

    return NextResponse.json({
      success: true,
      submissionId,
      eventId,
      message: "Submission approvata e evento pubblicato.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Non autenticato" || error.message.includes("Accesso negato"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Errore approve submission:", error);
    return NextResponse.json(
      {
        error: "Errore durante l'approvazione.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
