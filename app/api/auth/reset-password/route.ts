import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { resetPasswordWithOtpCode } from "@/lib/password-reset";
import { purgeLegacyNextAuthCookies } from "@/lib/auth-session-cookie";

export const dynamic = "force-dynamic";

const LIMIT = 10;

export async function POST(request: Request) {
  const res = NextResponse.json({ ok: true });
  purgeLegacyNextAuthCookies(res);

  const ip = getClientIp(request);
  if (rateLimit(`reset-password:${ip}`, LIMIT) !== null) {
    const err = NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });
    purgeLegacyNextAuthCookies(err);
    return err;
  }

  let body: { email?: string; code?: string; newPassword?: string; confirmPassword?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "Compila tutti i campi" }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Le password non coincidono" }, { status: 400 });
  }

  const outcome = await resetPasswordWithOtpCode(email, code, newPassword);
  if (!outcome.ok) {
    if (outcome.error === "weak_password") {
      return NextResponse.json({ error: "La password deve essere di almeno 6 caratteri" }, { status: 400 });
    }
    if (outcome.error === "not_found") {
      return NextResponse.json(
        { error: "Codice non valido o scaduto. Richiedi un nuovo codice." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Errore durante il reset. Riprova." }, { status: 500 });
  }

  return res;
}
