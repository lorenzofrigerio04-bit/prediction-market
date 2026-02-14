import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function validateUsername(value: unknown): { ok: true; username: string } | { ok: false; error: string } {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, error: "Username obbligatorio" };
  }
  const username = value.trim();
  if (username.length < USERNAME_MIN) {
    return { ok: false, error: `Almeno ${USERNAME_MIN} caratteri` };
  }
  if (username.length > USERNAME_MAX) {
    return { ok: false, error: `Massimo ${USERNAME_MAX} caratteri` };
  }
  if (!USERNAME_REGEX.test(username)) {
    return { ok: false, error: "Solo lettere, numeri e underscore" };
  }
  return { ok: true, username };
}

/**
 * PATCH /api/profile
 * Aggiorna username (e opzionalmente name) del profilo. Validazione lato server.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { username: rawUsername } = body;

    const validated = validateUsername(rawUsername);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: {
        username: validated.username,
        id: { not: session.user.id },
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Username già in uso" }, { status: 409 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { username: validated.username },
    });

    return NextResponse.json({ username: validated.username });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del profilo" },
      { status: 500 }
    );
  }
}
