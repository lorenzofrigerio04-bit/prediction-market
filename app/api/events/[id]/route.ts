import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventDetailPayload } from "@/lib/events/get-event-detail-payload";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    const payload = await getEventDetailPayload(eventId, session?.user?.id);
    if (!payload) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    const res = NextResponse.json(payload);
    res.headers.set("Cache-Control", "private, no-store, no-cache, must-revalidate");
    return res;
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dell'evento" },
      { status: 500 }
    );
  }
}

/** PATCH: solo il creatore può aggiornare il proprio evento (campi editabili). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, createdById: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (event.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Non puoi modificare un evento creato da altri" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { title, description, category, closesAt, resolutionSourceUrl } = body;
    const data: { title?: string; description?: string | null; category?: string; closesAt?: Date; resolutionSourceUrl?: string | null } = {};
    if (title !== undefined) data.title = typeof title === "string" ? title.trim() : "";
    if (description !== undefined) data.description = description == null || description === "" ? null : String(description).trim();
    if (category !== undefined) data.category = typeof category === "string" ? category.trim() : "";
    if (closesAt !== undefined) data.closesAt = new Date(closesAt);
    if (resolutionSourceUrl !== undefined) data.resolutionSourceUrl = resolutionSourceUrl == null || resolutionSourceUrl === "" ? null : String(resolutionSourceUrl).trim();
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ ok: true });
    }
    await prisma.event.update({
      where: { id: eventId },
      data,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento dell'evento" },
      { status: 500 }
    );
  }
}

/** DELETE: solo il creatore può eliminare il proprio evento (cascade su relazioni). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, createdById: true },
    });
    if (!event) {
      return NextResponse.json({ error: "Evento non trovato" }, { status: 404 });
    }
    if (event.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "Non puoi eliminare un evento creato da altri" },
        { status: 403 }
      );
    }
    await prisma.event.delete({ where: { id: eventId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione dell'evento" },
      { status: 500 }
    );
  }
}
