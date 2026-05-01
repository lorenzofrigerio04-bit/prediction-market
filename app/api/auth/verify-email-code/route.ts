import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyEmailWithCode } from "@/lib/email-verification";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { track } from "@/lib/analytics";

export const dynamic = "force-dynamic";

const TRY_LIMIT = 15;

/** POST JSON { email: string, code: string } */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (rateLimit(`verify-email-code:${ip}`, TRY_LIMIT)) {
    return NextResponse.json({ error: "Troppe richieste." }, { status: 429 });
  }

  let body: { email?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const code = typeof body.code === "string" ? body.code : "";

  const result = await verifyEmailWithCode(email, code);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason === "expired" ? "Codice scaduto." : "Codice o email non validi." },
      { status: 400 }
    );
  }

  if (result.userId) {
    track("USER_SIGNUP", { userId: result.userId }, { request });
  }

  if (result.wasFreshVerification) {
    const u = await prisma.user.findUnique({
      where: { email: result.email },
      select: { name: true },
    });
    sendWelcomeEmail(result.email, u?.name ?? null).catch((e) =>
      console.error("[verify-email-code] welcome email", e)
    );
  }

  return NextResponse.json({ ok: true });
}
