"use client";

import { useEffect } from "react";
import { PredictionMasterWordmark } from "@/components/PredictionMasterMark";

interface LoadingBlockProps {
  message?: string;
  /** @default true — schermata piena, nient’altro visibile */
  fullscreen?: boolean;
  className?: string;
}

export default function LoadingBlock({
  message = "Caricamento…",
  fullscreen = true,
  className = "",
}: LoadingBlockProps) {
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [fullscreen]);

  const inner = (
    <>
      <div
        className="relative flex h-[200px] w-[200px] max-w-[min(88vw,200px)] shrink-0 items-center justify-center sm:h-[220px] sm:w-[220px] sm:max-w-[220px]"
        aria-busy="true"
        role="status"
      >
        <div
          className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin motion-reduce:animate-none"
          aria-hidden
        />
        <PredictionMasterWordmark className="relative z-10 pointer-events-none !text-[1.05rem] sm:!text-[1.2rem] md:!text-[1.35rem]" />
      </div>
      {!fullscreen && message ? (
        <p className="mt-8 text-ds-body-sm text-fg-muted font-medium max-w-[20rem]">
          {message}
        </p>
      ) : null}
    </>
  );

  if (fullscreen) {
    return (
      <div
        className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-admin-bg text-fg px-4 text-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] ${className}`}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {inner}
    </div>
  );
}
