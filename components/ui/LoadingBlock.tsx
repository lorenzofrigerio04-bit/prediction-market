"use client";

import LoadingChart from "./LoadingChart";

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
      <div className="inline-flex items-center justify-center text-primary" aria-hidden>
        <LoadingChart />
      </div>
      {message && (
        <p className="mt-4 text-ds-body-sm text-fg-muted font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
