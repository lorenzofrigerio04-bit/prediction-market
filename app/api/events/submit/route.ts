import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateEventSubmission } from "@/lib/event-submission/validate";
import { toCandidateDraftContract } from "@/lib/integration/adapters/candidate-submission-adapter";
import { manualDraftToCandidate } from "@/lib/integration/adapters/manual-submission-to-candidate-adapter";
import { validateAgainstMdeContract } from "@/lib/integration/adapters/market-design-shadow-validator";
import { validateCandidates } from "@/lib/event-gen-v2/rulebook-validator";
import { scoreCandidate } from "@/lib/event-publishing/scoring";
import { publishSelectedV2 } from "@/lib/event-gen-v2/publisher";
import { handleMissionEvent } from "@/lib/missions/mission-progress-service";
import { checkAndAwardBadges } from "@/lib/badges";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Devi effettuare il login per creare un evento." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, category, closesAt, resolutionSource, notifyPhone } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Il titolo è obbligatorio." },
        { status: 400 }
      );
    }

    if (!category?.trim()) {
      return NextResponse.json(
        { error: "La categoria è obbligatoria." },
        { status: 400 }
      );
    }

    if (!closesAt) {
      return NextResponse.json(
        { error: "La data di chiusura è obbligatoria." },
        { status: 400 }
      );
    }

    const closesAtDate = new Date(closesAt);
    if (Number.isNaN(closesAtDate.getTime())) {
      return NextResponse.json(
        { error: "La data di chiusura non è valida." },
        { status: 400 }
      );
    }

    const candidateDraft = toCandidateDraftContract({
      title,
      description,
      category,
      closesAt: closesAtDate,
      resolutionSource,
      notifyPhone,
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

    const categoryToSave = validation.valid ? validation.normalizedCategory! : category.trim();
    const reviewNotesToSave = [
      ...(validation.valid ? [] : validation.errors ?? []),
      ...(!mdeValidationBlocked || !mdeShadow.reason ? [] : [mdeShadow.reason]),
    ];

    // MDE-only: quando la validazione è ok, crea l'evento solo tramite path MDE (no legacy/fallback).
    // MDE_AUTHORITATIVE_MANUAL_SUBMIT è deprecato: il path è sempre MDE quando auto-approve è possibile.
    if (
      validation.valid &&
      !mdeValidationBlocked &&
      validation.dedupKey != null &&
      validation.normalizedCategory != null
    ) {
      let eventId: string | undefined;
      let pendingReason: string | null = null;

      const candidate = manualDraftToCandidate(
        candidateDraft,
        validation.normalizedCategory
      );
      const rulebookResult = validateCandidates([candidate]);

      if (process.env.NODE_ENV !== "test") {
        console.info("[submit] path=mde_only candidateValidation=" + (rulebookResult.valid.length > 0 ? "valid" : "rejected"), {
          rejectedReasons: rulebookResult.rejectionReasons,
        });
      }

      if (rulebookResult.valid.length > 0) {
        const storylineStats = { momentum: 50, novelty: 50 };
        const scored = scoreCandidate(
          rulebookResult.valid[0],
          storylineStats
        );
        const now = new Date();
        const publishResult = await publishSelectedV2(
          prisma,
          [scored],
          now,
          { createdById: session.user.id }
        );

        if (process.env.NODE_ENV !== "test") {
          console.info("[submit] path=mde_only publishResult", {
            createdCount: publishResult.createdCount,
            eventIds: publishResult.eventIds?.length ?? 0,
          });
        }

        if (
          publishResult.eventIds &&
          publishResult.eventIds.length > 0
        ) {
          eventId = publishResult.eventIds[0];
          handleMissionEvent(prisma, session.user.id, "CREATE_EVENT", {
            eventId,
          }).catch((e) =>
            console.error("Mission progress (CREATE_EVENT) error:", e)
          );
          checkAndAwardBadges(prisma, session.user.id).catch((e) =>
            console.error("Badge check after event create error:", e)
          );
        } else {
          pendingReason =
            "Pubblicazione MDE non ha creato evento (es. dedup/skip).";
        }
      } else {
        const firstReject = rulebookResult.rejected[0];
        pendingReason = firstReject?.reason ?? "Rulebook MDE ha rifiutato il candidato.";
      }

      if (eventId) {
        const submission = await prisma.eventSubmission.create({
          data: {
            title: candidateDraft.title,
            description: candidateDraft.description,
            category: categoryToSave,
            closesAt: candidateDraft.closesAt,
            resolutionSource: candidateDraft.resolutionSourceUrl,
            submittedById: session.user.id,
            status: "APPROVED",
            eventId,
            notifyPhone: candidateDraft.metadata.notifyPhone,
          },
        });

        return NextResponse.json({
          success: true,
          approved: true,
          eventId,
          submissionId: submission.id,
          message: "Evento pubblicato con successo.",
        });
      }

      // Reject o publish senza evento: PENDING, nessun evento legacy.
      const submission = await prisma.eventSubmission.create({
        data: {
          title: candidateDraft.title,
          description: candidateDraft.description,
          category: categoryToSave,
          closesAt: candidateDraft.closesAt,
          resolutionSource: candidateDraft.resolutionSourceUrl,
          submittedById: session.user.id,
          status: "PENDING",
          notifyPhone: candidateDraft.metadata.notifyPhone,
          reviewNotes: pendingReason ?? (reviewNotesToSave.length > 0 ? reviewNotesToSave.join(" | ") : null),
        },
      });

      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: "EVENT_SUBMISSION_PENDING",
          data: JSON.stringify({
            submissionId: submission.id,
            title: candidateDraft.title,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        approved: false,
        pendingReview: true,
        submissionId: submission.id,
        message: "Il tuo evento è in revisione. Ti avviseremo quando verrà approvato.",
      });
    }

    // Altrimenti: salva in revisione (PENDING)
    const submission = await prisma.eventSubmission.create({
      data: {
            title: candidateDraft.title,
            description: candidateDraft.description,
        category: categoryToSave,
            closesAt: candidateDraft.closesAt,
            resolutionSource: candidateDraft.resolutionSourceUrl,
        submittedById: session.user.id,
        status: "PENDING",
            notifyPhone: candidateDraft.metadata.notifyPhone,
        reviewNotes: reviewNotesToSave.length > 0 ? reviewNotesToSave.join(" | ") : null,
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "EVENT_SUBMISSION_PENDING",
        data: JSON.stringify({
          submissionId: submission.id,
          title: candidateDraft.title,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      approved: false,
      pendingReview: true,
      submissionId: submission.id,
      message: "Il tuo evento è in revisione. Ti avviseremo quando verrà approvato.",
    });
  } catch (error) {
    console.error("Error submitting event:", error);
    return NextResponse.json(
      { error: "Errore durante l'invio dell'evento." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const submissions = await prisma.eventSubmission.findMany({
      where: {
        submittedById: session.user.id,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Errore durante il caricamento." },
      { status: 500 }
    );
  }
}
