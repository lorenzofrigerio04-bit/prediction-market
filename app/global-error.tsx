"use client";

/**
 * Cattura errori non gestiti nel root layout (es. getServerSession, DB).
 * In produzione evita la pagina bianca e mostra un messaggio con possibilità di riprovare.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "32rem", margin: "0 auto", background: "#f8fafc", color: "#1e293b" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Qualcosa è andato storto</h1>
        <p style={{ marginBottom: "1.5rem", color: "#64748b" }}>
          Si è verificato un errore. Prova a ricaricare la pagina o a tornare alla home.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Riprova
          </button>
          <a
            href="/"
            style={{
              padding: "0.5rem 1rem",
              background: "#e2e8f0",
              color: "#334155",
              borderRadius: "0.375rem",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Torna alla home
          </a>
        </div>
        {process.env.NODE_ENV === "development" && (
          <pre style={{ marginTop: "1.5rem", padding: "1rem", background: "#f1f5f9", borderRadius: "0.375rem", fontSize: "0.75rem", overflow: "auto" }}>
            {error.message}
          </pre>
        )}
      </body>
    </html>
  );
}
