import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const VERIFY_EXPIRY_HOURS = 24;
const SEND_LIMIT = 3; // invii per IP per ora (circa)

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * POST: invia (o reinvia) l'email di verifica.
 * - Se loggato: usa l'email della sessione.
 * - Body opzionale: { email } per reinvio a un indirizzo specifico (deve essere l'email dell'utente loggato).
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
      return NextResponse.json(
        { message: "Email già verificata.", verified: true },
        { status: 200 }
      );
    }

    const token = generateToken();
    const expires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

    const result = await sendVerificationEmail(email, verifyUrl);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Impossibile inviare l'email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Email di verifica inviata. Controlla la casella (e lo spam).",
    });
  } catch (e) {
    console.error("[send-verification-email]", e);
    return NextResponse.json(
      { error: "Errore durante l'invio." },
      { status: 500 }
    );
  }
}
