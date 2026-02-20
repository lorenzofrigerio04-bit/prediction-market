import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const { title, description, category, closesAt, resolutionSource } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Il titolo è obbligatorio." },
        { status: 400 }
      );
    }

    if (title.trim().length < 10) {
      return NextResponse.json(
        { error: "Il titolo deve essere di almeno 10 caratteri." },
        { status: 400 }
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        { error: "Il titolo non può superare i 200 caratteri." },
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
    const minCloseDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (closesAtDate < minCloseDate) {
      return NextResponse.json(
        { error: "La data di chiusura deve essere almeno 24 ore nel futuro." },
        { status: 400 }
      );
    }

    const submission = await prisma.eventSubmission.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: category.trim(),
        closesAt: closesAtDate,
        resolutionSource: resolutionSource?.trim() || null,
        submittedById: session.user.id,
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "EVENT_SUBMISSION_RECEIVED",
        data: JSON.stringify({
          submissionId: submission.id,
          title: submission.title,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: "Evento inviato per revisione.",
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
      return NextResponse.json(
        { error: "Non autorizzato." },
        { status: 401 }
      );
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
