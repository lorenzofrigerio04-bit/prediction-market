import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateEventSubmission, createEventFromSubmission } from "@/lib/event-submission/validate";

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
    const phoneToSave = typeof notifyPhone === "string" && notifyPhone.trim() ? notifyPhone.trim() : null;

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

    const validation = await validateEventSubmission({
      title: title.trim(),
      description: description?.trim() || null,
      category: category.trim(),
      closesAt: closesAtDate,
      resolutionSource: resolutionSource?.trim() || null,
    });

    const categoryToSave = validation.valid ? validation.normalizedCategory! : category.trim();
    const reviewNotesToSave = !validation.valid && validation.errors?.length
      ? validation.errors.join(" | ")
      : null;

    // Se la validazione è ok, prova a creare subito l'evento (pubblicazione immediata + missione "Primo evento")
    if (
      validation.valid &&
      validation.dedupKey != null &&
      validation.normalizedCategory != null
    ) {
      const createResult = await createEventFromSubmission(
        {
          title: title.trim(),
          description: description?.trim() || null,
          category: categoryToSave,
          closesAt: closesAtDate,
          resolutionSource: resolutionSource?.trim() || null,
        },
        session.user.id,
        validation.dedupKey,
        validation.normalizedCategory
      );

      if (createResult.success && createResult.eventId) {
        const submission = await prisma.eventSubmission.create({
          data: {
            title: title.trim(),
            description: description?.trim() || null,
            category: categoryToSave,
            closesAt: closesAtDate,
            resolutionSource: resolutionSource?.trim() || null,
            submittedById: session.user.id,
            status: "APPROVED",
            eventId: createResult.eventId,
            notifyPhone: phoneToSave,
          },
        });

        return NextResponse.json({
          success: true,
          approved: true,
          eventId: createResult.eventId,
          submissionId: submission.id,
          message: "Evento pubblicato con successo.",
        });
      }
    }

    // Altrimenti: salva in revisione (PENDING)
    const submission = await prisma.eventSubmission.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: categoryToSave,
        closesAt: closesAtDate,
        resolutionSource: resolutionSource?.trim() || null,
        submittedById: session.user.id,
        status: "PENDING",
        notifyPhone: phoneToSave,
        reviewNotes: reviewNotesToSave,
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "EVENT_SUBMISSION_PENDING",
        data: JSON.stringify({
          submissionId: submission.id,
          title: title.trim(),
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
