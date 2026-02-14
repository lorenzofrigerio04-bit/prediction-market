"use client";

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
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Qualcosa è andato storto</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Si è verificato un errore su questa pagina. Puoi riprovare o tornare alla home.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Riprova
        </button>
        <a
          href="/"
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
        >
          Torna alla home
        </a>
      </div>
    </div>
  );
}
