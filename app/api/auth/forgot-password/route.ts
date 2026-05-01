import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createAndSendPasswordResetCode } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

const LIMIT = 5;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (rateLimit(`forgot-password:${ip}`, LIMIT) !== null) {
    return NextResponse.json(
      { error: "Troppe richieste. Riprova tra un minuto." },
      { status: 429 }
    );
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "Email obbligatoria" }, { status: 400 });
  }

  const result = await createAndSendPasswordResetCode(email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    ...(result.attemptedSend && result.emailError
      ? { verificationEmailError: result.emailError }
      : {}),
  });
}
