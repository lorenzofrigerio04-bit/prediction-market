import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID report mancante" }, { status: 400 });
    }

    const report = await prisma.oracleReport.findUnique({
      where: { id },
      include: { chat: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report non trovato" }, { status: 404 });
    }

    if (report.chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    await prisma.oracleReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Oracle report delete error:", err);
    return NextResponse.json(
      { error: "Errore nell'eliminazione del report" },
      { status: 500 }
    );
  }
}
