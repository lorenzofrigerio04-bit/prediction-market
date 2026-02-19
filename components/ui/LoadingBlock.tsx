"use client";

interface LoadingBlockProps {
  message?: string;
  className?: string;
}

export default function LoadingBlock({
  message = "Caricamento…",
  className = "",
}: LoadingBlockProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div
        className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
        aria-hidden
      />
      {message && (
        <p className="mt-4 text-ds-body-sm text-fg-muted font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
