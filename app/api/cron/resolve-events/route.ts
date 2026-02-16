import { NextRequest, NextResponse } from "next/server";
import { getCanonicalBaseUrl } from "@/lib/canonical-base-url";

export const dynamic = "force-dynamic";

/**
 * Endpoint per cron job: segnala gli eventi chiusi in attesa di risoluzione.
 * Non imposta l'esito (va verificato dalla fonte e impostato da Admin → Risoluzione).
 * Risposta: pendingResolutionCount, pendingResolutionIds, pendingResolution.
 * Richiede: GET + header Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.VERCEL === "1";

    // In produzione CRON_SECRET è obbligatorio: l'endpoint non deve essere aperto
    if (isProduction && !cronSecret) {
      return NextResponse.json(
        { error: "CRON_SECRET non configurato" },
        { status: 503 }
      );
    }
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Chiama l'endpoint di risoluzione con il segreto per autorizzare il cron
    const baseUrl = getCanonicalBaseUrl();
    const resolveResponse = await fetch(`${baseUrl}/api/events/resolve-closed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cronSecret && {
          Authorization: `Bearer ${cronSecret}`,
        }),
      },
    });

    const result = await resolveResponse.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Errore nel cron job:", error);
    return NextResponse.json(
      { error: "Failed to process cron job", details: String(error) },
      { status: 500 }
    );
  }
}
