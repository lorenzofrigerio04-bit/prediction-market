import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint per cron job che processa automaticamente gli eventi chiusi
 * Può essere chiamato da un cron esterno (es. Vercel Cron, GitHub Actions, etc.)
 * 
 * Per sicurezza, richiede un header Authorization
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autorizzazione (opzionale ma consigliato)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Chiama l'endpoint di risoluzione con il segreto per autorizzare il cron
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
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
