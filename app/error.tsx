"use client";

import BackLink from "@/components/ui/BackLink";

/**
 * Cattura errori nelle pagine/segmenti dell'app e mostra un fallback invece di pagina bianca.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-12 bg-bg">
      <h2 className="text-xl font-semibold text-fg mb-2">Qualcosa è andato storto</h2>
      <p className="text-fg-muted mb-6 text-center max-w-md">
        Si è verificato un errore su questa pagina. Puoi riprovare o tornare indietro.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded-2xl hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg"
        >
          Riprova
        </button>
        <BackLink
          href="/"
          className="px-4 py-2 box-raised border border-border dark:border-white/10 text-fg rounded-2xl hover:border-primary/20 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg inline-block"
        >
          Indietro
        </BackLink>
      </div>
    </div>
  );
}
