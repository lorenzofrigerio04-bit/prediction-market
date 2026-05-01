import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCanonicalBaseUrl } from "@/lib/canonical-base-url";
import { sendEventExpiryResolutionReminderEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

function isAuthorized(
  request: NextRequest
): { ok: true } | { ok: false; status: number; body: object } {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET?.trim();
  const isProduction = process.env.VERCEL === "1";

  if (isProduction && !cronSecret) {
    return {
      ok: false,
      status: 503,
      body: { error: "CRON_SECRET non configurato" },
    };
  }
  if (!cronSecret) {
    return { ok: true };
  }
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token !== cronSecret) {
    return { ok: false, status: 401, body: { error: "Unauthorized" } };
  }
  return { ok: true };
}

function formatClosesLabel(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("it-IT", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/** Promemoria unico quando mancano ≤24h alla chiusura (mercati ancora aperti). */
const REMINDER_BATCH = 80;

export async function GET(request: NextRequest) {
  const auth = isAuthorized(request);
  if (!auth.ok) {
    return NextResponse.json(auth.body, { status: auth.status });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const events = await prisma.event.findMany({
    where: {
      resolved: false,
      hidden: false,
      status: "OPEN",
      closesAt: { gt: now, lte: horizon },
      expiryReminderEmailSentAt: null,
      createdBy: {
        email: { not: null },
        role: { notIn: ["BOT", "SYSTEM"] },
      },
    },
    select: {
      id: true,
      title: true,
      timezone: true,
      closesAt: true,
      createdBy: { select: { email: true } },
    },
    take: REMINDER_BATCH,
  });

  const base = getCanonicalBaseUrl();
  let sent = 0;
  const errors: string[] = [];

  for (const ev of events) {
    const to = ev.createdBy.email;
    if (!to) continue;
    const url = `${base}/eventi/${ev.id}`;
    const tz = ev.timezone?.trim() || "Europe/Rome";
    const label = formatClosesLabel(ev.closesAt, tz);
    try {
      const r = await sendEventExpiryResolutionReminderEmail(to, ev.title, url, label);
      if (!r.ok) {
        errors.push(`${ev.id}: ${r.error ?? "invio fallito"}`);
        continue;
      }
      await prisma.event.update({
        where: { id: ev.id },
        data: { expiryReminderEmailSentAt: now },
      });
      sent += 1;
    } catch (e) {
      errors.push(`${ev.id}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    checked: events.length,
    sent,
    errors: errors.length ? errors : undefined,
  });
}
