import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** POST — marca come visto il popup “Congratulazioni / crediti”. */
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { creditsWelcomeDismissedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
