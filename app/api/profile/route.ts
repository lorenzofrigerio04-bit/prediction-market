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

const MAX_IMAGE_BASE64_LENGTH = 600_000; // ~450KB decoded
const DATA_URL_IMAGE_REGEX = /^data:image\/(jpeg|png|gif|webp);base64,/i;

function validateImage(value: unknown): { ok: true; image: string } | { ok: false; error: string } {
  if (value == null || value === "") {
    return { ok: true, image: "" };
  }
  if (typeof value !== "string") {
    return { ok: false, error: "Immagine non valida" };
  }
  // URL esterno (es. da OAuth) o data URL
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return { ok: true, image: value };
  }
  if (!DATA_URL_IMAGE_REGEX.test(value)) {
    return { ok: false, error: "Formato immagine non supportato (usa JPEG, PNG, GIF o WebP)" };
  }
  if (value.length > MAX_IMAGE_BASE64_LENGTH) {
    return { ok: false, error: "Immagine troppo grande. Riducila e riprova." };
  }
  return { ok: true, image: value };
}

/**
 * PATCH /api/profile
 * Aggiorna username (name) e/o immagine profilo. Almeno uno dei due opzionali.
 */
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { username: rawUsername, image: rawImage } = body;

    const data: { name?: string; image?: string | null } = {};

    if (rawUsername !== undefined) {
      const validated = validateUsername(rawUsername);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }
      const existing = await prisma.user.findFirst({
        where: {
          name: validated.username,
          id: { not: session.user.id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Nome già in uso" }, { status: 409 });
      }
      data.name = validated.username;
    }

    if (rawImage !== undefined) {
      const img = validateImage(rawImage);
      if (!img.ok) {
        return NextResponse.json({ error: img.error }, { status: 400 });
      }
      data.image = img.image === "" ? null : img.image;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Invia almeno username o immagine" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    const updated = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true },
    });

    return NextResponse.json({
      name: updated?.name ?? undefined,
      image: updated?.image ?? undefined,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento del profilo" },
      { status: 500 }
    );
  }
}
