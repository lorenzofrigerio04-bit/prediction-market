import { NextRequest, NextResponse } from "next/server";
import {
  getOAuthIntentCookieOptions,
  PM_OAUTH_INTENT_COOKIE,
  type OAuthIntent,
} from "@/lib/oauth-intent-cookie";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }
  const intent =
    typeof body === "object" &&
    body !== null &&
    "intent" in body &&
    typeof (body as { intent?: string }).intent === "string"
      ? (body as { intent: string }).intent
      : null;
  if (intent !== "login" && intent !== "signup") {
    return NextResponse.json({ error: "intent deve essere login o signup" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PM_OAUTH_INTENT_COOKIE, intent as OAuthIntent, getOAuthIntentCookieOptions());
  return res;
}
