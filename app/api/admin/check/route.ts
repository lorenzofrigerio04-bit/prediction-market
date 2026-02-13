import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";

/**
 * GET /api/admin/check
 * Verifica se l'utente corrente è un admin
 */
export async function GET() {
  try {
    const adminStatus = await isAdmin();
    return NextResponse.json({ isAdmin: adminStatus });
  } catch (error) {
    console.error("Error checking admin status:", error);
    return NextResponse.json({ isAdmin: false });
  }
}
