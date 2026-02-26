import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Salva il numero di telefono per essere avvisati quando l'evento in revisione viene approvato. Richiede accettazione termini. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
    }

    const { id: submissionId } = await params;
    const body = await request.json();
    const { phone, acceptTerms } = body;

    if (!acceptTerms) {
      return NextResponse.json(
        { error: "È necessario accettare i termini e condizioni." },
        { status: 400 }
      );
    }

    const raw = (phone ?? "").toString().trim().replace(/\s/g, "");
    if (!raw || raw.length < 8) {
      return NextResponse.json(
        { error: "Inserisci un numero di telefono valido." },
        { status: 400 }
      );
    }

    const submission = await prisma.eventSubmission.findFirst({
      where: { id: submissionId, submittedById: session.user.id, status: "PENDING" },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Proposta non trovata o già elaborata." },
        { status: 404 }
      );
    }

    await prisma.eventSubmission.update({
      where: { id: submissionId },
      data: { notifyPhone: raw },
    });

    return NextResponse.json({ success: true, message: "Grazie! Ti avviseremo quando l'evento sarà approvato." });
  } catch (error) {
    console.error("Error saving notify phone:", error);
    return NextResponse.json(
      { error: "Errore durante il salvataggio." },
      { status: 500 }
    );
  }
}
