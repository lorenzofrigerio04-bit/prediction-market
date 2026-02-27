import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateEventSubmission } from "@/lib/event-submission/validate";

/** GET: solo l'autore può leggere la propria submission (solo se PENDING). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const { id: submissionId } = await params;
    const submission = await prisma.eventSubmission.findFirst({
      where: {
        id: submissionId,
        submittedById: session.user.id,
        status: "PENDING",
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        closesAt: true,
        resolutionSource: true,
      },
    });
    if (!submission) {
      return NextResponse.json(
        { error: "Proposta non trovata o già elaborata." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ...submission,
      closesAt: submission.closesAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento della proposta." },
      { status: 500 }
    );
  }
}

/** PATCH: solo l'autore può aggiornare la propria submission (solo se PENDING). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const { id: submissionId } = await params;
    const submission = await prisma.eventSubmission.findFirst({
      where: {
        id: submissionId,
        submittedById: session.user.id,
        status: "PENDING",
      },
    });
    if (!submission) {
      return NextResponse.json(
        { error: "Proposta non trovata o già elaborata." },
        { status: 404 }
      );
    }
    const body = await request.json();
    const { title, description, category, closesAt, resolutionSource } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: "Il titolo è obbligatorio." }, { status: 400 });
    }
    if (!category?.trim()) {
      return NextResponse.json({ error: "La categoria è obbligatoria." }, { status: 400 });
    }
    if (!closesAt) {
      return NextResponse.json({ error: "La data di chiusura è obbligatoria." }, { status: 400 });
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
    const reviewNotesToSave =
      !validation.valid && validation.errors?.length
        ? validation.errors.join(" | ")
        : null;
    await prisma.eventSubmission.update({
      where: { id: submissionId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        category: categoryToSave,
        closesAt: closesAtDate,
        resolutionSource: resolutionSource?.trim() || null,
        reviewNotes: reviewNotesToSave,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento della proposta." },
      { status: 500 }
    );
  }
}

/** DELETE: solo l'autore può eliminare la propria submission (solo se PENDING). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const { id: submissionId } = await params;
    const submission = await prisma.eventSubmission.findFirst({
      where: {
        id: submissionId,
        submittedById: session.user.id,
        status: "PENDING",
      },
    });
    if (!submission) {
      return NextResponse.json(
        { error: "Proposta non trovata o già elaborata." },
        { status: 404 }
      );
    }
    await prisma.eventSubmission.delete({ where: { id: submissionId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting submission:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione della proposta." },
      { status: 500 }
    );
  }
}
