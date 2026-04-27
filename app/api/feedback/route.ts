import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const { category, message, email, page } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Messaggio richiesto" }, { status: 400 });
    }

    const validCategories = ["bug", "idea", "question", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Categoria non valida" }, { status: 400 });
    }

    await prisma.feedback.create({
      data: {
        category,
        message: message.trim(),
        email: email?.trim() || null,
        userId: session?.user?.id ?? null,
        page: page || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[feedback] Error saving feedback:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
