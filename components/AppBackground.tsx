"use client";

/**
 * Sfondo globale: colore unificato (admin-bg) su tutte le pagine.
 * Nessuna foto di sfondo: header e contenuto condividono lo stesso sfondo.
 */
export default function AppBackground() {
  return (
    <div
      className="app-background-unified"
      aria-hidden
      role="presentation"
    />
  );
}
