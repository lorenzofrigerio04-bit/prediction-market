import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createAndSendVerificationEmail } from "@/lib/email-verification";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const SEND_LIMIT = 3;

/**
 * POST: invia (o reinvia) l'email di verifica con codice numerico + link.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = rateLimit(`verify-email:${ip}`, SEND_LIMIT);
  if (limited) {
    return NextResponse.json(
      { error: "Troppe richieste. Riprova tra un po'." },
      { status: 429 }
    );
  }

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: "Devi essere loggato per richiedere l'email di verifica." },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ status: 200 });
    }

    const result = await createAndSendVerificationEmail(email);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Impossibile inviare l'email." },
        { status: 500 }
      );
    }

    return NextResponse.json({});
  } catch (e) {
    console.error("[send-verification-email]", e);
    return NextResponse.json(
      { error: "Errore durante l'invio." },
      { status: 500 }
    );
  }
}
