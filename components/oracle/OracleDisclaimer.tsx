"use client";

export default function OracleDisclaimer() {
  return (
    <div
      className="px-4 py-2 flex items-center gap-2 bg-amber-500/5 border-b border-amber-500/10 text-amber-600/90 dark:text-amber-400/80 text-ds-micro"
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0" aria-hidden>ℹ️</span>
      <span>
        Oracle potrebbe commettere errori. Le previsioni non costituiscono consulenza.
      </span>
    </div>
  );
}
