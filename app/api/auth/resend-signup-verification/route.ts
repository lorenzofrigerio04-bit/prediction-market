import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/email-verification";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const RESEND_LIMIT = 4;

/** POST JSON { email: string } — reinvio codice durante registrazione (nessun login). */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (rateLimit(`resend-signup-verification:${ip}`, RESEND_LIMIT)) {
    return NextResponse.json(
      { error: "Troppe richieste. Riprova tra un po'." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  if (!emailRaw) {
    return NextResponse.json({ error: "Email mancante" }, { status: 400 });
  }

  const pending = await prisma.verificationToken.findFirst({
    where: {
      identifier: { equals: emailRaw, mode: "insensitive" },
      pendingPasswordHash: { not: null },
      expires: { gt: new Date() },
    },
    orderBy: { expires: "desc" },
  });

  if (!pending?.pendingPasswordHash) {
    return NextResponse.json(
      { error: "Nessuna registrazione in corso per questa email. Ricompila il modulo oppure accedi." },
      { status: 404 }
    );
  }

  const result = await createAndSendVerificationEmail(pending.identifier, {
    pendingPasswordHash: pending.pendingPasswordHash,
    pendingName: pending.pendingName,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Impossibile inviare l’email." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
